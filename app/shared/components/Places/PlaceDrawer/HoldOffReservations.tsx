'use client';

import { useState } from 'react';

import { useHoldOffReservations, useResumeReservations } from '@/app/shared/hooks/usePlaces';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { TimePicker } from '@/components/ui/time-picker';
import {
  PlaceAvailabilityException,
  PlaceAvailabilityRule,
  PlaceReservationProfile,
} from '@/types/placeReservation';

import {
  EMPTY_HOLD_OFF,
  HoldOffDraft,
  HoldOffMode,
  buildHoldOffPlan,
  describeHoldOff,
  hasCompleteHoldOffDates,
  holdOffError,
  upcomingHoldOffs,
} from './hold-off';
import { dayKey, parseDayKey } from './week-strip';

const MODES: { value: HoldOffMode; label: string }[] = [
  { value: 'few-hours', label: 'A few hours' },
  { value: 'multiple-days', label: 'Multiple days' },
];

const FIELD_LABEL = 'block text-sm font-medium text-gray-800';

const heldOnLabel = (date: string): string =>
  parseDayKey(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const HoldOffReservations = ({
  placeId,
  profile,
  rules,
  exceptions,
}: {
  placeId: string;
  profile: PlaceReservationProfile;
  rules: PlaceAvailabilityRule[];
  exceptions: PlaceAvailabilityException[];
}) => {
  const { toast } = useToast();
  const [draft, setDraft] = useState<HoldOffDraft>(EMPTY_HOLD_OFF);
  const [resumingId, setResumingId] = useState<string | null>(null);

  const { mutate: holdOff, isPending: isHoldingOff } = useHoldOffReservations(placeId, profile.id);
  const { mutate: resume } = useResumeReservations(placeId, profile.id);

  const set = (patch: Partial<HoldOffDraft>) => setDraft((current) => ({ ...current, ...patch }));
  const today = dayKey(new Date());
  const error = holdOffError(draft, rules);
  const canHoldOff = hasCompleteHoldOffDates(draft) && !error;
  const held = upcomingHoldOffs(exceptions);

  const submit = () => {
    if (!canHoldOff) return;

    holdOff(buildHoldOffPlan(draft, rules, exceptions), {
      onSuccess: () => {
        toast({
          title: 'Reservations held off',
          description: 'Guests cannot book these dates. Existing bookings stay.',
          variant: 'success',
        });
        setDraft(EMPTY_HOLD_OFF);
      },
      onError: (failure: Error) =>
        toast({
          title: 'Could not hold off these dates',
          description: failure.message,
          variant: 'destructive',
        }),
    });
  };

  const resumeOn = (exception: PlaceAvailabilityException) => {
    setResumingId(exception.id);
    resume(exception.id, {
      onSuccess: () =>
        toast({
          title: 'Reservations resumed',
          description: `Guests can book ${heldOnLabel(exception.date)} again.`,
          variant: 'success',
        }),
      onError: (failure: Error) =>
        toast({
          title: 'Could not resume',
          description: failure.message,
          variant: 'destructive',
        }),
      onSettled: () => setResumingId(null),
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-6">
      <div>
        <h3 className="text-[19px] font-bold tracking-[-0.2px] text-brand-ink">
          Hold off reservations
        </h3>
        <p className="mt-1.5 text-sm leading-snug text-ink-muted">
          Stop new bookings for a while. Reservations you have already taken stay as they are.
        </p>
      </div>

      <PillRadioGroup
        value={draft.mode}
        onChange={(mode) => set({ mode: mode as HoldOffMode })}
        options={MODES}
      />

      {draft.mode === 'few-hours' ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className={FIELD_LABEL}>Date</label>
            <DatePicker
              value={draft.date ?? undefined}
              onChange={(date) => set({ date })}
              placeholder="Select date"
              minDate={parseDayKey(today)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className={FIELD_LABEL}>From</label>
              <TimePicker
                value={draft.startTime ?? undefined}
                onChange={(startTime) => set({ startTime })}
                placeholder="Start time"
              />
            </div>
            <div className="space-y-2">
              <label className={FIELD_LABEL}>Until</label>
              <TimePicker
                value={draft.endTime ?? undefined}
                onChange={(endTime) => set({ endTime })}
                placeholder="End time"
                minTime={draft.startTime ?? undefined}
              />
            </div>
          </div>

          <p className="text-[13.5px] leading-snug text-ink-muted">
            Leave the times empty to hold off the whole day.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className={FIELD_LABEL}>First day</label>
            <DatePicker
              value={draft.rangeStartDate ?? undefined}
              onChange={(rangeStartDate) => set({ rangeStartDate })}
              placeholder="Start date"
              minDate={parseDayKey(today)}
              rangeStart={draft.rangeStartDate ?? undefined}
              rangeEnd={draft.rangeEndDate ?? undefined}
            />
          </div>
          <div className="space-y-2">
            <label className={FIELD_LABEL}>Last day</label>
            <DatePicker
              value={draft.rangeEndDate ?? undefined}
              onChange={(rangeEndDate) => set({ rangeEndDate })}
              placeholder="End date"
              minDate={
                draft.rangeStartDate ? parseDayKey(draft.rangeStartDate) : parseDayKey(today)
              }
              rangeStart={draft.rangeStartDate ?? undefined}
              rangeEnd={draft.rangeEndDate ?? undefined}
            />
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-[13.5px] leading-snug text-red-600">
          {error}
        </p>
      )}

      <Button
        type="button"
        variant="gradient"
        onClick={submit}
        disabled={!canHoldOff}
        isLoading={isHoldingOff}
        className="h-12 w-fit rounded-full px-6 text-[15px] font-semibold"
      >
        Hold off reservations
      </Button>

      <section aria-label="Dates held off" className="space-y-3">
        <h4 className="text-[15px] font-semibold text-gray-800">Dates held off</h4>

        {held.length === 0 ? (
          <p className="text-sm leading-snug text-ink-muted">
            Nothing is held off. Guests can book every open day.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {held.map((exception) => (
              <li key={exception.id} className="flex items-center gap-3 py-3">
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-semibold text-brand-ink">
                    {heldOnLabel(exception.date)}
                  </span>
                  <span className="text-sm text-ink-muted">{describeHoldOff(exception)}</span>
                </span>
                <Button
                  type="button"
                  variant="outline-primary"
                  isLoading={resumingId === exception.id}
                  onClick={() => resumeOn(exception)}
                  aria-label={`Resume ${heldOnLabel(exception.date)}`}
                  className="h-11 flex-shrink-0 rounded-full px-5 text-sm font-semibold"
                >
                  Resume
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
