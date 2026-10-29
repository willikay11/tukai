'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { WEEKDAYS } from '@/app/shared/components/Places/WeekdayPills';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/utils';
import { formatTimeTo12Hour } from '@/utils/date-utils';

import { ReservationSettingsValues } from '../ReservationSettings/schemas';

const FREE_RESERVATION = {
  value: 'restaurant_reservation',
  label: 'Free reservation',
  note: 'Guests book for free. You accept each request, then admit guests when they arrive.',
} as const;

// Deposit and entry fees have no backing fields on the API yet (no amount, no
// category list, no per-place wallet) - see the reservation_settings_backend_gaps
// memory. Shown as disabled pills rather than built out, so nobody can save a
// paid setup that silently does nothing for guests.
const COMING_SOON_TYPES = [
  { label: 'Deposit to confirm', id: 'deposit' },
  { label: 'Entry fees', id: 'entry' },
] as const;

const EXPIRY_OPTIONS = [
  { value: '1', label: '1 hour' },
  { value: '2', label: '2 hours' },
  { value: '6', label: '6 hours' },
  { value: '24', label: '24 hours' },
] as const;

const FIELD_BOX =
  'h-14 rounded-xl border-line px-4 py-0 focus-within:shadow-[0_0_0_3px_#E8F1ED] [&>span]:!text-ink-muted [&_svg]:!h-5 [&_svg]:!w-5';
const FIELD_TEXT_SIZE = 'text-[15px]';

const Divider = () => <div aria-hidden="true" className="-mx-6 h-px bg-surface-muted" />;

const Pill = ({
  label,
  isSelected,
  role,
  small,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  role?: 'radio';
  small?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    role={role}
    aria-checked={role ? isSelected : undefined}
    aria-pressed={role ? undefined : isSelected}
    onClick={onClick}
    className={cn(
      'whitespace-nowrap rounded-full font-semibold',
      small ? 'h-11 px-[18px] text-[14.5px]' : 'h-12 px-5 text-[14.5px]',
      isSelected
        ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
        : 'bg-surface text-gray-800',
    )}
  >
    {label}
  </button>
);

const ComingSoonPill = ({ label, describedBy }: { label: string; describedBy: string }) => (
  <button
    type="button"
    role="radio"
    aria-checked={false}
    aria-disabled="true"
    aria-describedby={describedBy}
    className="inline-flex h-12 cursor-not-allowed flex-col items-center justify-center whitespace-nowrap rounded-full bg-surface px-5 text-ink-subtle"
  >
    <span className="text-[14.5px] font-semibold leading-tight">{label}</span>
    <span className="text-[11px] font-medium leading-tight">Coming soon</span>
  </button>
);

const Question = ({ label, hint }: { label: string; hint?: string }) => (
  <span className="text-[15px] font-semibold leading-[1.35] text-gray-800">
    {label}
    {hint && <span className="text-[13.5px] font-normal text-ink-muted"> ({hint})</span>}
  </span>
);

const Note = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-xl bg-surface px-3.5 py-3 text-[13.5px] leading-[1.45] text-gray-800">
    {children}
  </p>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-[13.5px] leading-snug text-danger">{message}</p> : null;

const ErrorSummary = ({ message }: { message: string }) => (
  <div
    role="alert"
    className="flex items-start gap-2 rounded-xl bg-warn-surface px-3.5 py-3 text-[13.5px] leading-[1.45] text-warn"
  >
    <IconComponent
      iconName="InformationCircleIcon"
      size={16}
      color="currentColor"
      className="mt-0.5 flex-shrink-0"
    />
    <span className="min-w-0 flex-1">{message}</span>
  </div>
);

export const ReservationSettingsForm = ({
  values,
  errors,
  errorSummary,
  set,
}: {
  values: ReservationSettingsValues;
  errors: Record<string, string>;
  errorSummary: string | null;
  set: (patch: Partial<ReservationSettingsValues>) => void;
}) => {
  const hoursLine =
    values.opensAt && values.closesAt && values.opensAt !== values.closesAt
      ? `${formatTimeTo12Hour(values.opensAt)} - ${formatTimeTo12Hour(values.closesAt)}` +
        (values.closesAt < values.opensAt ? ', closing after midnight' : '')
      : 'Set an opening and a closing time';

  const toggleDay = (day: string) =>
    set({
      days: values.days.includes(day)
        ? values.days.filter((entry) => entry !== day)
        : [...values.days, day],
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-[19px] font-bold tracking-[-0.2px] text-gray-800">
            Reservation type and fees
          </h3>
          <p className="mt-1.5 text-sm leading-normal text-ink-muted">
            Choose how guests reserve this place, and whether they pay anything to book.
          </p>
        </div>

        <div role="radiogroup" aria-label="Reservation type" className="flex flex-wrap gap-2">
          <Pill
            role="radio"
            label={FREE_RESERVATION.label}
            isSelected={values.reservationType === FREE_RESERVATION.value}
            onClick={() => set({ reservationType: FREE_RESERVATION.value })}
          />
          {COMING_SOON_TYPES.map((type) => (
            <ComingSoonPill key={type.id} label={type.label} describedBy="rs-paid-types-note" />
          ))}
        </div>
        <p id="rs-paid-types-note" className="sr-only">
          Available once Tukai supports paid reservations.
        </p>

        <Note>{FREE_RESERVATION.note}</Note>
      </div>

      <Divider />

      <div className="flex flex-col gap-2.5">
        <Question label="Total seating capacity" hint="most guests you can host at once" />
        <Input
          type="number"
          min={1}
          inputMode="numeric"
          aria-label="Total seating capacity"
          placeholder="Enter seating capacity"
          value={values.seatingCapacity}
          onChange={(event) => set({ seatingCapacity: event.target.value })}
          containerClassName={FIELD_BOX}
          className={FIELD_TEXT_SIZE}
          suffixIcon={<IconComponent iconName="UserMultipleIcon" color="currentColor" />}
        />
        <FieldError message={errors.seatingCapacity} />
      </div>

      <div className="flex flex-col gap-2.5">
        <Question label="Max party size per booking" hint="largest group on one booking or table" />
        <Input
          type="number"
          min={1}
          inputMode="numeric"
          aria-label="Max party size per booking"
          placeholder="Enter max party size"
          value={values.partySize}
          onChange={(event) => set({ partySize: event.target.value })}
          containerClassName={FIELD_BOX}
          className={FIELD_TEXT_SIZE}
          suffixIcon={<IconComponent iconName="UserMultipleIcon" color="currentColor" />}
        />
        <FieldError message={errors.partySize} />
      </div>

      <Divider />

      <div className="flex flex-col gap-2.5">
        <Question label="Active days of the week" />
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <Pill
              key={day}
              label={day}
              isSelected={values.days.includes(day)}
              onClick={() => toggleDay(day)}
            />
          ))}
        </div>
        <FieldError message={errors.days} />
      </div>

      <div className="flex flex-col gap-2.5">
        <Question label="Opening hours" />
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
          <TimePicker
            value={values.opensAt}
            placeholder="Opening time"
            className="rounded-xl border-line text-[15px]"
            onChange={(opensAt) => set({ opensAt })}
          />
          <TimePicker
            value={values.closesAt}
            placeholder="Closing time"
            className="rounded-xl border-line text-[15px]"
            onChange={(closesAt) => set({ closesAt })}
          />
        </div>
        <FieldError message={errors.opensAt || errors.closesAt} />
        <Note>
          <span className="font-semibold">Open to guests:</span> {hoursLine}
        </Note>
      </div>

      <div className="flex flex-col gap-2.5">
        <Question label="Buffer between bookings" hint="time to reset a table, like 30 minutes" />
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          aria-label="Buffer between bookings in minutes"
          placeholder="Enter buffer"
          value={values.bufferMinutes}
          onChange={(event) => set({ bufferMinutes: event.target.value })}
          containerClassName={FIELD_BOX}
          className={FIELD_TEXT_SIZE}
          suffixIcon={<span className="text-[15px] text-ink-muted">minutes</span>}
        />
        <FieldError message={errors.bufferMinutes} />
      </div>

      <Divider />

      <div className="flex flex-col gap-2.5">
        <Question label="Answer requests by" hint="before the booking time" />
        <div role="radiogroup" aria-label="Answer requests by" className="flex flex-wrap gap-2">
          {EXPIRY_OPTIONS.map((option) => (
            <Pill
              key={option.value}
              role="radio"
              small
              label={option.label}
              isSelected={values.expiryHours === option.value}
              onClick={() => set({ expiryHours: option.value })}
            />
          ))}
        </div>
        <p className="text-[13.5px] leading-[1.45] text-ink-muted">
          Requests you haven&apos;t answered by then expire, and the guest is told.
        </p>
      </div>

      <p className="flex items-start gap-2 rounded-xl bg-surface px-3.5 py-3 text-[13.5px] leading-[1.45] text-gray-800">
        <IconComponent
          iconName="Clock01Icon"
          size={16}
          color="#066349"
          className="mt-0.5 flex-shrink-0"
        />
        Confirmed guests you haven&apos;t admitted move to No show at closing time
        {values.closesAt ? `, ${formatTimeTo12Hour(values.closesAt)}` : ''}.
      </p>

      {errorSummary && <ErrorSummary message={errorSummary} />}
    </div>
  );
};
