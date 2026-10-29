'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { SelectablePill, WeekdayPills } from '@/app/shared/components/Places/WeekdayPills';
import { Input } from '@/components/ui/input';
import { TimePicker, formatTimeLabel } from '@/components/ui/time-picker';

import { ReservationSettingsValues } from './schemas';

const RESERVATION_TYPES: {
  value: ReservationSettingsValues['reservationType'];
  label: string;
  detail: string;
}[] = [
  {
    value: 'restaurant_reservation',
    label: 'Free Reservation',
    detail: 'Guests book for free and just show up. You’ll still see every reservation.',
  },
];

const Divider = () => <div className="border-t border-gray-100" />;

export const ReservationSettingsFields = ({
  values,
  errors,
  set,
}: {
  values: ReservationSettingsValues;
  errors: Record<string, string>;
  set: (patch: Partial<ReservationSettingsValues>) => void;
}) => {
  const selectedType = RESERVATION_TYPES.find((entry) => entry.value === values.reservationType);
  const hoursPreview =
    values.opensAt && values.closesAt
      ? `${formatTimeLabel(values.opensAt)} - ${formatTimeLabel(values.closesAt)}`
      : 'Set opening and closing time.';

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Reservation Type</h2>
          <p className="mt-1 text-xs text-gray-500">
            Choose how guests reserve this place, it&apos;s exactly what they&apos;re making a
            reservation
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {RESERVATION_TYPES.map((type) => (
            <SelectablePill
              key={type.value}
              label={type.label}
              isSelected={values.reservationType === type.value}
              onClick={() => set({ reservationType: type.value })}
            />
          ))}
        </div>

        {selectedType && (
          <p className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-600">{selectedType.detail}</p>
        )}
      </section>

      <Divider />

      <section className="space-y-2">
        <label className="block text-sm font-medium text-gray-800">
          Total Seating Capacity{' '}
          <span className="text-muted-foreground">(Maximum guests you can host at once)</span>
        </label>
        <Input
          type="number"
          min={1}
          inputMode="numeric"
          aria-label="Total Seating Capacity"
          placeholder="Enter seating capacity"
          value={values.seatingCapacity}
          onChange={(event) => set({ seatingCapacity: event.target.value })}
          suffixIcon={
            <IconComponent iconName="UserGroupIcon" size={18} className="text-gray-400" />
          }
        />
        {errors.seatingCapacity && <p className="text-xs text-red-500">{errors.seatingCapacity}</p>}
      </section>

      <Divider />

      <section className="space-y-6">
        <div className="space-y-2">
          <WeekdayPills selected={values.days} onChange={(days) => set({ days })} />
          {errors.days && <p className="text-xs text-red-500">{errors.days}</p>}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800">Opening and Closing Hours</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TimePicker
              value={values.opensAt}
              placeholder="Opening Time"
              onChange={(opensAt) => set({ opensAt })}
            />
            <TimePicker
              value={values.closesAt}
              placeholder="Closing Time"
              minTime={values.opensAt}
              onChange={(closesAt) => set({ closesAt })}
            />
          </div>
          {(errors.opensAt || errors.closesAt) && (
            <p className="text-xs text-red-500">{errors.opensAt || errors.closesAt}</p>
          )}

          <p className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-600">
            <span className="font-semibold text-gray-900">Operating Hours: </span>
            {hoursPreview}
          </p>
        </div>
      </section>

      <Divider />

      <section className="space-y-2">
        <label className="block text-sm font-medium text-gray-800">
          Buffer between bookings{' '}
          <span className="text-muted-foreground">(Time to reset space/table e.g., 30 min)</span>
        </label>
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          aria-label="Buffer between bookings"
          placeholder="Enter buffer in minutes"
          value={values.bufferMinutes}
          onChange={(event) => set({ bufferMinutes: event.target.value })}
          suffixIcon={<span className="text-xs text-gray-400">minutes</span>}
        />
        {errors.bufferMinutes && <p className="text-xs text-red-500">{errors.bufferMinutes}</p>}
      </section>
    </div>
  );
};
