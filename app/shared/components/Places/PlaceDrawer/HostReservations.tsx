'use client';

import { useMemo, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  useAcceptPlaceBookingRequest,
  useAdmitPlaceBookingRequest,
  useDeclinePlaceBookingRequest,
  usePlaceBookingRequests,
} from '@/app/shared/hooks/usePlaces';
import { useToast } from '@/app/shared/hooks/useToast';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { cn } from '@/lib/utils';
import { Place } from '@/types/place';
import { PlaceReservationProfile } from '@/types/placeReservation';

import { WeekStrip } from './WeekStrip';
import {
  HOST_RESERVATION_GROUPS,
  HostReservation,
  HostReservationGroup,
  daysAwaitingAnswer,
  hostReservations,
  inGroup,
  isAdmittable,
  isAwaitingAnswer,
  liveCountsByDay,
  matchesGuest,
  paymentLine,
  reservationsOnDay,
} from './host-reservations';
import {
  addWeeks,
  buildWeekFromCounts,
  dayKey,
  dayLabel,
  isCurrentWeek,
  parseDayKey,
  weekStart,
} from './week-strip';

const MAX_DAY_DOTS = 3;

const EMPTY_LINES: Record<HostReservationGroup, (day: string) => string> = {
  reservations: (day) => `Nothing booked for ${day} yet.`,
  admitted: (day) => `No one has been admitted on ${day} yet.`,
  'no-show': (day) => `Nobody missed their booking on ${day}.`,
};

const timeOf = (reservation: HostReservation): string =>
  reservation.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

const firstName = (reservation: HostReservation): string => reservation.guestName.split(' ')[0];

const ReservationRow = ({
  reservation,
  isOpen,
  isAccepting,
  isAdmitting,
  onToggle,
  onAccept,
  onAdmit,
  onDecline,
}: {
  reservation: HostReservation;
  isOpen: boolean;
  isAccepting: boolean;
  isAdmitting: boolean;
  onToggle: () => void;
  onAccept: () => void;
  onAdmit: () => void;
  onDecline: () => void;
}) => {
  const picture = reservation.user?.pictureWebpSmUrl || reservation.user?.picture || undefined;
  const waiting = paymentLine(reservation);

  return (
    <li className="flex flex-col gap-3 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={`${reservation.guestName}, ${isOpen ? 'hide' : 'show'} details`}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <Avatar className="h-11 w-11">
            <AvatarImage src={picture} alt="" />
            <AvatarFallback className="bg-surface-brand text-brand">
              {reservation.guestName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[15.5px] font-semibold text-brand-ink">
              {reservation.guestName}
            </span>
            <span className="text-sm text-ink-muted">
              {reservation.partySize} {reservation.partySize === 1 ? 'guest' : 'guests'} ·{' '}
              {timeOf(reservation)}
            </span>
          </span>

          <IconComponent
            iconName={isOpen ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
            size={18}
            color="currentColor"
            className="flex-shrink-0 text-ink-muted"
          />
        </button>

        {isAwaitingAnswer(reservation) ? (
          <Button
            type="button"
            variant="lime"
            isLoading={isAccepting}
            onClick={onAccept}
            aria-label={`Accept ${reservation.guestName}'s request`}
            className="h-11 flex-shrink-0 rounded-full px-4 text-sm font-semibold"
          >
            <IconComponent iconName="Tick02Icon" size={18} color="currentColor" />
            Accept
          </Button>
        ) : isAdmittable(reservation) ? (
          <Button
            type="button"
            variant="lime"
            isLoading={isAdmitting}
            onClick={onAdmit}
            aria-label={`Admit ${reservation.guestName}`}
            className="h-11 flex-shrink-0 rounded-full px-4 text-sm font-semibold"
          >
            <IconComponent iconName="Tick02Icon" size={18} color="currentColor" />
            Admit
          </Button>
        ) : waiting ? (
          <span className="flex-shrink-0 text-[13px] text-ink-muted">{waiting}</span>
        ) : null}
      </div>

      {isOpen && (
        <div className="ml-14 flex flex-col gap-3 text-sm leading-snug text-gray-800">
          <p>
            <span className="font-semibold">Message: </span>
            {reservation.note || 'No message.'}
          </p>

          {isAwaitingAnswer(reservation) && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDecline}
              className="h-11 w-fit rounded-full px-5 text-sm font-semibold"
            >
              <IconComponent iconName="Cancel01Icon" size={18} color="currentColor" />
              Decline reservation
            </Button>
          )}
        </div>
      )}
    </li>
  );
};

// Reads one page of 100 requests, so a venue with more would lose the tail
export const HostReservations = ({
  place,
  profile,
  initialDay,
  initialGroup = 'reservations',
  onOpenHoldOff,
  onOpenSettings,
}: {
  place: Place;
  profile: PlaceReservationProfile;
  initialDay?: string;
  initialGroup?: HostReservationGroup;
  onOpenHoldOff: () => void;
  onOpenSettings: () => void;
}) => {
  const { toast } = useToast();
  const [anchor, setAnchor] = useState(() =>
    weekStart(initialDay ? parseDayKey(initialDay) : new Date()),
  );
  const [selectedKey, setSelectedKey] = useState(() => initialDay ?? dayKey(new Date()));
  const [group, setGroup] = useState<HostReservationGroup>(initialGroup);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingDecline, setPendingDecline] = useState<HostReservation | null>(null);

  const { data: requestsResponse, isLoading } = usePlaceBookingRequests(place.id, profile.id);
  const {
    mutate: acceptRequest,
    isPending: isAccepting,
    variables: accepting,
  } = useAcceptPlaceBookingRequest(place.id, profile.id);
  const {
    mutate: admitGuest,
    isPending: isAdmitting,
    variables: admitting,
  } = useAdmitPlaceBookingRequest(place.id, profile.id);
  const { mutate: declineRequest, isPending: isDeclining } = useDeclinePlaceBookingRequest(
    place.id,
    profile.id,
  );

  const reservations = useMemo(
    () => hostReservations(requestsResponse?.data?.results ?? []),
    [requestsResponse],
  );
  const week = useMemo(
    () => buildWeekFromCounts(anchor, liveCountsByDay(reservations)),
    [anchor, reservations],
  );
  const awaitingDays = useMemo(() => daysAwaitingAnswer(reservations), [reservations]);

  const onDay = reservationsOnDay(reservations, selectedKey);
  const rows = inGroup(onDay, group).filter((reservation) => matchesGuest(reservation, query));

  const moveTo = (weeks: number) => {
    const next = addWeeks(anchor, weeks);
    setAnchor(next);
    setSelectedKey(isCurrentWeek(next) ? dayKey(new Date()) : dayKey(next));
    setOpenId(null);
  };

  const accept = (reservation: HostReservation) =>
    acceptRequest(reservation.id, {
      onSuccess: () =>
        toast({
          title: 'Reservation accepted',
          description: `${firstName(reservation)} has been told.`,
          variant: 'success',
        }),
      onError: (error: Error) =>
        toast({ title: 'Could not accept', description: error.message, variant: 'destructive' }),
    });

  const admit = (reservation: HostReservation) =>
    admitGuest(reservation.id, {
      onSuccess: () =>
        toast({ title: 'Guest admitted', description: reservation.guestName, variant: 'success' }),
      onError: (error: Error) =>
        toast({ title: 'Could not admit', description: error.message, variant: 'destructive' }),
    });

  const confirmDecline = () => {
    if (!pendingDecline) return;

    declineRequest(pendingDecline.id, {
      onSuccess: () => {
        toast({
          title: 'Reservation declined',
          description: `${firstName(pendingDecline)} has been told.`,
          variant: 'success',
        });
        setPendingDecline(null);
      },
      onError: (error: Error) => {
        setPendingDecline(null);
        toast({ title: 'Could not decline', description: error.message, variant: 'destructive' });
      },
    });
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 px-6 py-6">
        <div>
          <h3 className="text-[19px] font-bold tracking-[-0.2px] text-brand-ink">Reservations</h3>
          <p className="mt-1.5 text-sm leading-snug text-ink-muted">
            Answer, admit and keep track of who is coming to {place.title}.
          </p>
        </div>

        <WeekStrip
          anchor={anchor}
          week={week}
          selectedKey={selectedKey}
          dotsFor={(day) => Math.min(day.experienceCount, MAX_DAY_DOTS)}
          dotClassNameFor={(day) => (awaitingDays.has(day.key) ? 'bg-red-500' : undefined)}
          onSelect={(key) => {
            setSelectedKey(key);
            setOpenId(null);
          }}
          onMove={moveTo}
        />

        <div className="-mx-6 overflow-x-auto px-6 scrollbar-hide">
          <PillRadioGroup
            value={group}
            onChange={(next) => {
              setGroup(next as HostReservationGroup);
              setOpenId(null);
            }}
            options={HOST_RESERVATION_GROUPS.map((entry) => ({
              value: entry.id,
              label: `${entry.label} (${inGroup(onDay, entry.id).length})`,
            }))}
          />
        </div>

        <Input
          type="search"
          aria-label="Search guests"
          placeholder="Search by guest name"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          suffixIcon={<IconComponent iconName="Search01Icon" size={18} className="text-gray-400" />}
        />

        {isLoading ? (
          <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
        ) : rows.length > 0 ? (
          <ul className={cn('divide-y divide-line')}>
            {rows.map((reservation) => (
              <ReservationRow
                key={reservation.id}
                reservation={reservation}
                isOpen={openId === reservation.id}
                isAccepting={isAccepting && accepting === reservation.id}
                isAdmitting={isAdmitting && admitting === reservation.id}
                onToggle={() => setOpenId(openId === reservation.id ? null : reservation.id)}
                onAccept={() => accept(reservation)}
                onAdmit={() => admit(reservation)}
                onDecline={() => setPendingDecline(reservation)}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-snug text-ink-muted">
            {query.trim()
              ? `No one matches "${query.trim()}" on ${dayLabel(selectedKey)}.`
              : EMPTY_LINES[group](dayLabel(selectedKey))}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 z-30 flex flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 pb-[calc(12px_+_env(safe-area-inset-bottom))] pt-3">
        <Button
          type="button"
          variant="outline-primary"
          onClick={onOpenHoldOff}
          className="h-12 rounded-full px-5 text-[15px] font-semibold"
        >
          <IconComponent iconName="StopCircleIcon" size={20} color="currentColor" />
          Hold off reservations
        </Button>
        <Button
          type="button"
          variant="outline-primary"
          onClick={onOpenSettings}
          className="h-12 rounded-full px-5 text-[15px] font-semibold"
        >
          <IconComponent iconName="Settings02Icon" size={20} color="currentColor" />
          Reservation settings
        </Button>
      </div>

      <AlertDialog
        open={pendingDecline !== null}
        onOpenChange={(open) => !open && setPendingDecline(null)}
      >
        <AlertDialogContent className="max-w-md gap-5 rounded-2xl p-6">
          <AlertDialogHeader className="space-y-2 text-left sm:text-left">
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Decline this reservation?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-gray-500">
              {pendingDecline ? firstName(pendingDecline) : 'The guest'} is told there is no table
              for them. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 sm:gap-3">
            <AlertDialogCancel className="border-0 bg-transparent font-medium text-gray-600 shadow-none hover:bg-transparent hover:text-gray-900">
              Keep it
            </AlertDialogCancel>
            <Button
              variant="destructive"
              isLoading={isDeclining}
              onClick={confirmDecline}
              className="rounded-lg px-5"
            >
              Decline reservation
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
