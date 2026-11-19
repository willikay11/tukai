'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { WEEKDAYS } from '@/app/shared/components/Places/WeekdayPills';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/utils';
import { formatTimeTo12Hour } from '@/utils/date-utils';

import {
  PAY_WITHIN_OPTIONS,
  RESPOND_WITHIN_OPTIONS,
  ReservationSettingsValues,
  isPaidReservation,
} from '../ReservationSettings/schemas';

export const PAYMENT_TYPES = [
  {
    value: 'free',
    label: 'Free reservation',
    note: 'Guests book for free. You accept each request, then admit guests when they arrive.',
  },
  {
    value: 'deposit',
    label: 'Deposit to confirm',
    note: 'Guests pay a deposit per guest once you accept. It comes off their final bill and cuts no-shows.',
  },
  {
    value: 'entry_fee',
    label: 'Entry fees',
    note: 'Guests pay per person by guest type, like adults, kids or residents, once you accept.',
  },
] as const;

export const hoursLabel = (hours: string): string => `${hours} ${hours === '1' ? 'hour' : 'hours'}`;

/** The pills, plus a saved value that isn't one of them so it still shows. */
const withSaved = (options: readonly string[], saved: string): string[] =>
  options.includes(saved) || !saved
    ? [...options]
    : [...options, saved].sort((a, b) => Number(a) - Number(b));

const digitsOnly = (value: string, max: number) => value.replace(/\D/g, '').slice(0, max);

const formatAmount = (amount: string) => Number(amount).toLocaleString('en-KE');

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

const MoneyPrefix = ({ currency }: { currency: string }) => (
  <span className="text-[15px] font-semibold text-gray-800">{currency}</span>
);

const HoursPills = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) => (
  <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
    {options.map((option) => (
      <Pill
        key={option}
        role="radio"
        small
        label={hoursLabel(option)}
        isSelected={value === option}
        onClick={() => onChange(option)}
      />
    ))}
  </div>
);

/** Guest categories and their prices, for entry fees. */
const EntryFees = ({
  fees,
  currency,
  error,
  onChange,
}: {
  fees: ReservationSettingsValues['entryFees'];
  currency: string;
  error?: string;
  onChange: (fees: ReservationSettingsValues['entryFees']) => void;
}) => {
  const [guestType, setGuestType] = useState('');
  const [amount, setAmount] = useState('');
  const isReady = guestType.trim().length > 0 && Number(amount) > 0;

  const add = () => {
    if (!isReady) return;
    onChange([...fees, { guestType: guestType.trim(), amount }]);
    setGuestType('');
    setAmount('');
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Question label="Guest categories and prices" />
      {fees.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fees.map((fee, index) => (
            <span
              key={`${fee.guestType}-${index}`}
              className="inline-flex min-h-[52px] items-center gap-1 rounded-xl bg-surface pl-4 pr-1 text-sm text-gray-800"
            >
              <span className="flex flex-col gap-px">
                <span className="font-semibold">{fee.guestType}</span>
                <span className="text-[12.5px] text-ink-muted">
                  {currency} {formatAmount(fee.amount)} per head
                </span>
              </span>
              <button
                type="button"
                aria-label={`Remove ${fee.guestType}`}
                onClick={() => onChange(fees.filter((_, at) => at !== index))}
                className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:text-danger"
              >
                <IconComponent iconName="Cancel01Icon" size={16} color="currentColor" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,180px),1fr))] gap-3">
        <Input
          aria-label="Guest category"
          placeholder="Category, like Residents, Kids or Adults"
          maxLength={30}
          value={guestType}
          onChange={(event) => setGuestType(event.target.value)}
          containerClassName={FIELD_BOX}
          className={FIELD_TEXT_SIZE}
          suffixIcon={<IconComponent iconName="UserGroupIcon" color="currentColor" />}
        />
        <Input
          inputMode="numeric"
          aria-label="Amount per head"
          placeholder="Amount per head"
          value={amount}
          onChange={(event) => setAmount(digitsOnly(event.target.value, 6))}
          onKeyDown={(event) => event.key === 'Enter' && add()}
          containerClassName={FIELD_BOX}
          className={FIELD_TEXT_SIZE}
          icon={<MoneyPrefix currency={currency} />}
          suffixIcon={<IconComponent iconName="Wallet02Icon" color="currentColor" />}
        />
      </div>
      <button
        type="button"
        disabled={!isReady}
        onClick={add}
        className={cn(
          'inline-flex h-11 items-center gap-2 self-start rounded-full px-4 text-sm font-semibold',
          isReady ? 'bg-surface-brand text-brand' : 'bg-surface text-ink-subtle',
        )}
      >
        <IconComponent iconName="Add01Icon" size={17} color="currentColor" />
        {fees.length > 0 ? 'Add another category' : 'Add category'}
      </button>
      <FieldError message={error} />
    </div>
  );
};

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
  currency = 'KES',
  set,
}: {
  values: ReservationSettingsValues;
  errors: Record<string, string>;
  errorSummary: string | null;
  currency?: string;
  set: (patch: Partial<ReservationSettingsValues>) => void;
}) => {
  const paymentType =
    PAYMENT_TYPES.find((type) => type.value === values.paymentType) ?? PAYMENT_TYPES[0];

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
          {PAYMENT_TYPES.map((type) => (
            <Pill
              key={type.value}
              role="radio"
              label={type.label}
              isSelected={values.paymentType === type.value}
              onClick={() => set({ paymentType: type.value })}
            />
          ))}
        </div>

        <Note>{paymentType.note}</Note>
      </div>

      {values.paymentType === 'deposit' && (
        <div className="flex flex-col gap-2.5">
          <Question
            label="Deposit per guest"
            hint="paid once you accept, taken off the final bill"
          />
          <Input
            inputMode="numeric"
            aria-label="Deposit per guest"
            placeholder="Amount per guest"
            value={values.depositAmount}
            onChange={(event) => set({ depositAmount: digitsOnly(event.target.value, 6) })}
            containerClassName={FIELD_BOX}
            className={FIELD_TEXT_SIZE}
            icon={<MoneyPrefix currency={currency} />}
            suffixIcon={<IconComponent iconName="Wallet02Icon" color="currentColor" />}
          />
          <FieldError message={errors.depositAmount} />
        </div>
      )}

      {values.paymentType === 'entry_fee' && (
        <EntryFees
          fees={values.entryFees}
          currency={currency}
          error={errors.entryFees}
          onChange={(entryFees) => set({ entryFees })}
        />
      )}

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
          onChange={(event) => set({ seatingCapacity: digitsOnly(event.target.value, 4) })}
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
          onChange={(event) => set({ partySize: digitsOnly(event.target.value, 4) })}
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
        {/* The server counts this from when the request comes in, not back
            from the booking time as the design's hint had it */}
        <Question label="Answer requests within" hint="after a request comes in" />
        <HoursPills
          label="Answer requests within"
          options={withSaved(RESPOND_WITHIN_OPTIONS, values.respondWithinHours)}
          value={values.respondWithinHours}
          onChange={(respondWithinHours) => set({ respondWithinHours })}
        />
        <p className="text-[13.5px] leading-[1.45] text-ink-muted">
          Requests you haven&apos;t answered by then expire, and the guest is told.
        </p>
      </div>

      {isPaidReservation(values.paymentType) && (
        <div className="flex flex-col gap-2.5">
          <Question label="Time to pay" hint="after you accept" />
          <HoursPills
            label="Time to pay"
            options={withSaved(PAY_WITHIN_OPTIONS, values.payWithinHours)}
            value={values.payWithinHours}
            onChange={(payWithinHours) => set({ payWithinHours })}
          />
          <p className="text-[13.5px] leading-[1.45] text-ink-muted">
            If the guest doesn&apos;t pay in time, the booking is released and they&apos;re told.
          </p>
        </div>
      )}

      <p className="flex items-start gap-2 rounded-xl bg-surface px-3.5 py-3 text-[13.5px] leading-[1.45] text-gray-800">
        <IconComponent
          iconName="Clock01Icon"
          size={16}
          color="#066349"
          className="mt-0.5 flex-shrink-0"
        />
        {/* No-shows are marked by the host, not moved at closing time as the
            design had it: the API has no automatic no-show (DEV-407) */}
        Once a booking&apos;s time has passed, you can mark a confirmed guest who didn&apos;t come
        as a no-show from Reservations.
      </p>

      {errorSummary && <ErrorSummary message={errorSummary} />}
    </div>
  );
};
