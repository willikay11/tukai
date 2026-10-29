'use client';

import { useMemo, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useCreatePlaceBookingRequest } from '@/app/shared/hooks/usePlaces';
import { toast } from '@/app/shared/hooks/useToast';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { coverPhotoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceReservationProfile } from '@/types/placeReservation';

import {
  BookingAvailability,
  blockedRanges,
  bookingConfigFor,
  buildBookingDays,
  dayChipLabel,
  dayChipNote,
  formatAnswerBy,
  formatSlotTime,
} from './booking';

const SECTION_LABEL = 'text-[15px] font-semibold text-gray-800';

const guestsLabel = (count: number) => `${count} ${count === 1 ? 'guest' : 'guests'}`;

export const PlaceBookingForm = ({
  place,
  profile,
  availability,
  now,
  onDone,
}: {
  place: Place;
  profile: PlaceReservationProfile;
  availability: BookingAvailability;
  now?: Date;
  onDone: () => void;
}) => {
  const [clock] = useState(() => now ?? new Date());
  const [dayOffset, setDayOffset] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [party, setParty] = useState(2);
  const [message, setMessage] = useState('');

  const { mutate: requestBooking, isPending } = useCreatePlaceBookingRequest(place.id, profile.id);

  const config = bookingConfigFor(profile);
  const days = useMemo(() => buildBookingDays(availability, clock), [availability, clock]);
  const firstBookableDay = days.find((day) => day.slots.length > 0) ?? null;
  const selectedDay =
    days.find((day) => day.offset === dayOffset && day.slots.length > 0) ?? firstBookableDay;

  const slots = selectedDay?.slots ?? [];
  const selectedTime = time && slots.includes(time) ? time : null;
  const isReady = Boolean(selectedDay && selectedTime);
  const blocked = blockedRanges(days);

  const changeParty = (step: number) => {
    if (step > 0 && party >= config.maxGuests) {
      toast({ description: `Up to ${config.maxGuests} guests per booking at ${place.title}.` });
      return;
    }
    setParty(Math.max(1, party + step));
  };

  const handleSend = () => {
    if (!selectedDay || !selectedTime) {
      toast({
        description: !selectedDay ? 'No open days to book right now.' : 'Pick a time first.',
      });
      return;
    }

    requestBooking(
      {
        requestedDate: selectedDay.iso,
        requestedTime: selectedTime,
        partySize: party,
        specialRequests: message.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          const respondBy: string | undefined = response?.data?.respondBy;
          toast({
            description: respondBy
              ? `Request sent. ${place.title} has until ${formatAnswerBy(respondBy)} to answer.`
              : `Request sent. ${place.title} will answer it soon.`,
          });
          onDone();
        },
        onError: (error: Error) =>
          toast({
            title: 'Could not send this request',
            description: error.message,
            variant: 'destructive',
          }),
      },
    );
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 px-6 py-6">
        <div className="flex items-center gap-3.5">
          <span className="relative block h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
            <PhotoImage
              src={coverPhotoUrl(place.photos, 'md')}
              alt=""
              fill
              className="object-cover"
              fallbackIconSize={18}
            />
          </span>
          <span className="flex min-w-0 flex-col gap-[3px]">
            <span className="text-base font-semibold text-gray-800">{place.title}</span>
            {place.location?.city && (
              <span className="text-sm text-ink-muted">{place.location.city}</span>
            )}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="text-[19px] font-bold tracking-[-0.2px] text-gray-800">Book a table</h3>
          <p className="text-sm leading-snug text-ink-muted">
            Pick a day, a time and who is coming.
          </p>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-surface-brand px-3.5 py-3">
          <IconComponent
            iconName="Ticket01Icon"
            size={19}
            color="currentColor"
            className="mt-px flex-shrink-0 text-brand"
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-semibold text-brand-ink">Free booking</span>
            <span className="text-sm leading-snug text-gray-800">
              Free to book. {place.title} accepts each request.
            </span>
          </span>
        </div>

        <section aria-label="Day" className="flex flex-col gap-3">
          <span className={SECTION_LABEL}>Day</span>
          {firstBookableDay ? (
            <div
              role="radiogroup"
              aria-label="Day"
              className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-0.5 scrollbar-hide"
            >
              {days.map((day) => {
                const isOn = selectedDay?.offset === day.offset;
                const isBookable = day.slots.length > 0;

                return (
                  <button
                    key={day.iso}
                    type="button"
                    role="radio"
                    aria-checked={isOn}
                    disabled={!isBookable}
                    onClick={() => {
                      setDayOffset(day.offset);
                      setTime(null);
                    }}
                    className={cn(
                      'flex h-[60px] min-w-[84px] flex-shrink-0 flex-col items-center justify-center gap-0.5 rounded-full px-3 ring-1 ring-inset ring-line-shell',
                      isOn
                        ? 'bg-brand-ink text-white'
                        : isBookable
                          ? 'bg-white text-gray-800'
                          : 'cursor-default bg-transparent text-ink-subtle',
                    )}
                  >
                    <span className="text-sm font-bold">{dayChipLabel(day)}</span>
                    <span
                      className={cn(
                        'whitespace-nowrap text-xs',
                        isOn ? 'text-surface-brand' : 'text-ink-muted',
                      )}
                    >
                      {dayChipNote(day)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm leading-normal text-ink-muted">
              No open times in the next two weeks. Check back soon.
            </p>
          )}
          {blocked.length > 0 && (
            <p className="text-[13.5px] leading-snug text-ink-muted">
              New bookings are blocked {blocked.join(', ')}.
            </p>
          )}
        </section>

        <section aria-label="Time" className="flex flex-col gap-3">
          <span className={SECTION_LABEL}>Time</span>
          {slots.length > 0 ? (
            <div role="radiogroup" aria-label="Time" className="flex flex-wrap gap-2">
              {slots.map((slot) => {
                const isOn = slot === selectedTime;

                return (
                  <button
                    key={slot}
                    type="button"
                    role="radio"
                    aria-checked={isOn}
                    onClick={() => setTime(slot)}
                    className={cn(
                      'h-11 whitespace-nowrap rounded-full px-4 text-sm font-semibold ring-1 ring-inset ring-line-shell',
                      isOn ? 'bg-brand-ink text-white' : 'bg-white text-gray-800',
                    )}
                  >
                    {formatSlotTime(slot)}
                  </button>
                );
              })}
            </div>
          ) : (
            selectedDay && (
              <p className="text-sm text-ink-muted">No times left that day. Pick another day.</p>
            )
          )}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <span className="flex flex-col gap-0.5">
            <span className={SECTION_LABEL}>Guests</span>
            <span className="text-[13px] text-ink-muted">
              Up to {config.maxGuests} guests per booking
            </span>
          </span>
          <div
            role="group"
            aria-label="Guests"
            className="flex items-center gap-1.5 rounded-full bg-surface p-1"
          >
            <button
              type="button"
              onClick={() => changeParty(-1)}
              aria-label="One fewer guest"
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-ink',
                party <= 1 && 'opacity-40',
              )}
            >
              <IconComponent iconName="MinusSignIcon" size={18} color="currentColor" />
            </button>
            <span
              aria-live="polite"
              className="min-w-[84px] text-center text-[14.5px] font-bold text-brand-ink"
            >
              {guestsLabel(party)}
            </span>
            <button
              type="button"
              onClick={() => changeParty(1)}
              aria-label="One more guest"
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full bg-white text-brand-ink',
                party >= config.maxGuests && 'opacity-40',
              )}
            >
              <IconComponent iconName="PlusSignIcon" size={18} color="currentColor" />
            </button>
          </div>
        </div>

        <label className="flex flex-col gap-2">
          <span className={SECTION_LABEL}>
            Message for {place.title} <span className="font-normal text-ink-muted">(optional)</span>
          </span>
          <Textarea
            rows={3}
            maxLength={300}
            placeholder="A birthday, a high chair, step-free access..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="rounded-xl border-line focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_#E8F1ED]"
          />
        </label>
      </div>

      <div className="sticky bottom-0 z-30 border-t border-surface-muted bg-white px-6 pb-[calc(12px_+_env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={handleSend}
          disabled={isPending}
          className={cn(
            'h-[52px] w-full rounded-full px-5 text-[15.5px] font-bold transition-transform active:scale-[0.99]',
            isReady
              ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
              : 'bg-surface-brand text-ink',
          )}
        >
          {isPending ? 'Sending...' : 'Send request'}
        </button>
      </div>
    </>
  );
};
