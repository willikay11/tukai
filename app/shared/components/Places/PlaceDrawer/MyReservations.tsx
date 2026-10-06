'use client';

import { useMemo, useState } from 'react';

import { PhotoImage } from '@/app/shared/components/Images';
import {
  useCancelPlaceBookingRequest,
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { coverPhotoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceBookingRequest, PlaceReservationProfile } from '@/types/placeReservation';

import { UpcomingReservation, upcomingReservations } from './my-reservations';

const partyLine = (reservation: UpcomingReservation): string => {
  const time = reservation.start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const party = reservation.restaurantDetail?.partySize;
  return party ? `${party} Pax · ${time}` : time;
};

const ReservationCard = ({
  reservation,
  place,
}: {
  reservation: UpcomingReservation;
  place: Place;
}) => (
  <div className="flex items-center gap-3.5 rounded-[14px] border border-line-soft bg-white p-2.5">
    <PhotoImage
      src={coverPhotoUrl(place.photos, 'md')}
      alt=""
      width={64}
      height={64}
      sizes="64px"
      className="h-16 w-16 flex-shrink-0 rounded-xl bg-surface-brand object-cover"
    />

    <span className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="truncate text-base font-semibold text-brand-ink">{place.title}</span>
      <span className="flex min-w-0 items-center gap-2 text-sm text-ink-muted">
        <span className="flex-shrink-0 font-semibold text-brand-ink">{partyLine(reservation)}</span>
      </span>
    </span>

    {/* The dashed blue tile is the date the booking falls on */}
    <span className="flex h-16 w-[58px] flex-shrink-0 flex-col items-center justify-center gap-[3px] rounded-xl border border-dashed border-blue-200 bg-gradient-to-b from-blue-50 to-blue-100">
      <span className="text-sm text-brand-ink">
        {reservation.start.toLocaleDateString('en-GB', { month: 'short' })}
      </span>
      <span className="text-[17px] font-semibold leading-none text-brand-ink">
        {reservation.start.getDate()}
      </span>
    </span>
  </div>
);

/**
 * The reader's own upcoming table at this place, with a way to cancel it.
 *
 * Renders nothing unless the reader is signed in and holds a live reservation
 * here - the bookings request is session-gated, so an anonymous reader never
 * sends it.
 *
 * ⚠️ No edit: the API has no change endpoint, so changing a booking means
 * cancelling it and requesting again. Edit is left out rather than sending the
 * reader to a flow that would leave the old booking standing.
 */
export const MyReservations = ({
  place,
  profile,
}: {
  place: Place;
  profile?: PlaceReservationProfile;
}) => {
  const { toast } = useToast();
  const [index, setIndex] = useState(0);
  const [pendingCancel, setPendingCancel] = useState<PlaceBookingRequest | null>(null);

  const { data: bookingsResponse } = usePlaceBookingRequests(place.id, profile?.id);
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelPlaceBookingRequest(
    place.id,
    profile?.id,
  );

  const upcoming = useMemo(
    () => upcomingReservations(bookingsResponse?.data?.results ?? []),
    [bookingsResponse],
  );

  if (upcoming.length === 0) return null;

  // A cancelled booking leaves the list, so the pager can point past the end
  const current = upcoming[Math.min(index, upcoming.length - 1)];

  const confirmCancel = () => {
    if (!pendingCancel) return;

    cancelBooking(pendingCancel.id, {
      onSuccess: () => {
        setPendingCancel(null);
        toast({
          title: 'Reservation cancelled',
          description: `Your table at ${place.title} has been released.`,
          variant: 'success',
        });
      },
      onError: (error: Error) => {
        setPendingCancel(null);
        toast({ title: 'Could not cancel', description: error.message, variant: 'destructive' });
      },
    });
  };

  return (
    <section className="space-y-5 py-6">
      <div>
        <h3 className="text-[19px] font-bold tracking-[-0.2px] text-brand-ink">My reservations</h3>
        <p className="mt-1.5 text-sm leading-snug text-ink-muted">
          Your upcoming experiences and reservations at {place.title}
        </p>
      </div>

      <div className="flex flex-col gap-0.5 rounded-[18px] border border-line-soft bg-surface px-2 pt-2">
        <ReservationCard reservation={current} place={place} />

        <div className="flex flex-wrap items-center justify-between gap-x-2 px-1">
          {upcoming.length > 1 ? (
            <div className="flex min-h-11 items-center">
              {upcoming.map((reservation, position) => (
                <button
                  key={reservation.id}
                  type="button"
                  onClick={() => setIndex(position)}
                  aria-label={`Reservation ${position + 1} of ${upcoming.length}`}
                  aria-current={position === index}
                  className="flex h-11 w-[26px] items-center justify-center"
                >
                  <span
                    className={cn(
                      'block h-1.5 rounded-full',
                      position === index ? 'w-[18px] bg-brand' : 'w-1.5 bg-line',
                    )}
                  />
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={() => setPendingCancel(current)}
            disabled={isCancelling}
            className="inline-flex h-11 items-center text-[14.5px] font-semibold text-red-600 transition-colors hover:underline disabled:opacity-50"
          >
            Cancel reservation
          </button>
        </div>
      </div>

      <AlertDialog
        open={pendingCancel !== null}
        onOpenChange={(open) => !open && setPendingCancel(null)}
      >
        <AlertDialogContent className="max-w-md gap-5 rounded-2xl p-6">
          <AlertDialogHeader className="space-y-2 text-left sm:text-left">
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              Cancel this reservation?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-gray-500">
              Your table at {place.title} will be released. You can request another one whenever you
              like.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Not AlertDialogAction: that closes on click, and the spinner has to
              stay up while the request is in flight */}
          <AlertDialogFooter className="gap-2 sm:gap-3">
            <AlertDialogCancel className="border-0 bg-transparent font-medium text-gray-600 shadow-none hover:bg-transparent hover:text-gray-900">
              Keep it
            </AlertDialogCancel>
            <Button
              variant="destructive"
              isLoading={isCancelling}
              onClick={confirmCancel}
              className="rounded-lg px-5"
            >
              Cancel reservation
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};
