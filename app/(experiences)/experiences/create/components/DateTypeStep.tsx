'use client';

import { useCallback } from 'react';

import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { CommunitySelector, type Community } from './CommunitySelector';
import { ExperienceTypePicker } from './ExperienceTypePicker';
import { ExperienceTypeRadio } from './ExperienceTypeRadio';
import { RecurringDayPicker } from './RecurringDayPicker/RecurringDayPicker';
import { RecurrenceDateRange } from './RecurrenceDateRange/RecurrenceDateRange';
import { RecurrencePreviewLabel } from './RecurrencePreviewLabel/RecurrencePreviewLabel';
import { TimeSlotList, type TimeSlot } from './TimeSlotList/TimeSlotList';

type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface DateTypeFormData {
  community: Community | null;
  experiencePricing: 'paid' | 'free';
  experienceType: 'one-time' | 'multi-day' | 'itinerary';
  isRecurring: boolean;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  recurringDays: DayOfWeek[];
  recurrenceStartDate: string | null;
  recurrenceEndDate: string | null;
  timeSlots: TimeSlot[];
}

export interface DateTypeStepProps {
  formData: DateTypeFormData;
  communityOptions: Community[];
  onChange: (data: Partial<DateTypeFormData>) => void;
  errors: Record<string, string>;
}

export const DateTypeStep = ({
  formData,
  communityOptions,
  onChange,
  errors,
}: DateTypeStepProps) => {
  const handleCommunityChange = useCallback(
    (community: Community) => {
      onChange({ community });
    },
    [onChange],
  );

  const handlePricingChange = useCallback(
    (pricing: 'paid' | 'free') => {
      onChange({ experiencePricing: pricing });
    },
    [onChange],
  );

  const handleTypeChange = useCallback(
    (type: 'one-time' | 'multi-day' | 'itinerary') => {
      onChange({ experienceType: type });
    },
    [onChange],
  );

  const handleRecurringChange = useCallback(
    (isRecurring: boolean) => {
      if (isRecurring) {
        onChange({
          isRecurring: true,
          date: null,
          startTime: null,
          endTime: null,
        });
      } else {
        onChange({
          isRecurring: false,
          recurringDays: [],
          recurrenceStartDate: null,
          recurrenceEndDate: null,
          timeSlots: [{ startTime: null, endTime: null }],
        });
      }
    },
    [onChange],
  );

  const handleDateChange = useCallback(
    (date: string) => {
      onChange({ date });
    },
    [onChange],
  );

  const handleStartTimeChange = useCallback(
    (time: string) => {
      onChange({ startTime: time });
    },
    [onChange],
  );

  const handleEndTimeChange = useCallback(
    (time: string) => {
      onChange({ endTime: time });
    },
    [onChange],
  );

  const handleRecurringDaysChange = useCallback(
    (days: DayOfWeek[]) => {
      onChange({ recurringDays: days });
    },
    [onChange],
  );

  const handleRecurrenceStartDateChange = useCallback(
    (date: string) => {
      onChange({ recurrenceStartDate: date });
    },
    [onChange],
  );

  const handleRecurrenceEndDateChange = useCallback(
    (date: string) => {
      onChange({ recurrenceEndDate: date });
    },
    [onChange],
  );

  const handleTimeSlotsChange = useCallback(
    (slots: TimeSlot[]) => {
      onChange({ timeSlots: slots });
    },
    [onChange],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Add date and type of the experience
        </h2>
      </div>

      <CommunitySelector
        value={formData.community}
        options={communityOptions}
        onChange={handleCommunityChange}
        error={errors.community}
      />

      <ExperienceTypePicker value={formData.experiencePricing} onChange={handlePricingChange} />

      <ExperienceTypeRadio
        value={formData.experienceType}
        onChange={handleTypeChange}
        isRecurring={formData.isRecurring}
        onRecurringChange={handleRecurringChange}
      />

      {!formData.isRecurring ? (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-900 mb-2">
              Select Experience date(s)
            </label>
            <DatePicker value={formData.date || undefined} onChange={handleDateChange} />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-900 mb-2">Start Time</label>
              <TimePicker
                value={formData.startTime || undefined}
                onChange={handleStartTimeChange}
                placeholder="Select time"
              />
              {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-900 mb-2">End Time</label>
              <TimePicker
                value={formData.endTime || undefined}
                onChange={handleEndTimeChange}
                placeholder="Select time"
              />
              {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
            </div>
          </div>
        </>
      ) : (
        <>
          <RecurringDayPicker
            value={formData.recurringDays}
            onChange={handleRecurringDaysChange}
          />
          {errors.recurringDays && (
            <p className="text-xs text-red-500">{errors.recurringDays}</p>
          )}

          <RecurrenceDateRange
            startDate={formData.recurrenceStartDate}
            endDate={formData.recurrenceEndDate}
            onStartDateChange={handleRecurrenceStartDateChange}
            onEndDateChange={handleRecurrenceEndDateChange}
            errors={errors}
          />

          <RecurrencePreviewLabel
            selectedDays={formData.recurringDays}
            startDate={formData.recurrenceStartDate}
          />

          <TimeSlotList
            slots={formData.timeSlots}
            onChange={handleTimeSlotsChange}
            errors={errors}
          />
        </>
      )}
    </div>
  );
};
