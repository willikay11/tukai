'use client';

import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';

import { type Community, CommunitySelector } from '../CommunitySelector';
import { ExperienceTypeRadio } from '../ExperienceTypeRadio';
import { ItineraryDateSection } from '../ItineraryDateSection';
import { MultiDayDateSection } from '../MultiDayDateSection';
import { RecurrenceDateRange } from '../RecurrenceDateRange';
import { RecurrencePreviewLabel } from '../RecurrencePreviewLabel';
import { RecurringDayPicker } from '../RecurringDayPicker';
import { type TimeSlot, TimeSlotList } from '../TimeSlotList';

type DayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

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
  multiDayStartDate: string | null;
  multiDayStartTime: string | null;
  multiDayEndDate: string | null;
  multiDayEndTime: string | null;
  itineraryStartDate: string | null;
  itineraryEndDate: string | null;
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
  const router = useRouter();

  const handleCommunityChange = useCallback(
    (community: Community | null) => {
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

  const handleMultiDayStartDateChange = useCallback(
    (date: string) => {
      onChange({ multiDayStartDate: date });
    },
    [onChange],
  );

  const handleMultiDayStartTimeChange = useCallback(
    (time: string) => {
      onChange({ multiDayStartTime: time });
    },
    [onChange],
  );

  const handleMultiDayEndDateChange = useCallback(
    (date: string) => {
      onChange({ multiDayEndDate: date });
    },
    [onChange],
  );

  const handleMultiDayEndTimeChange = useCallback(
    (time: string) => {
      onChange({ multiDayEndTime: time });
    },
    [onChange],
  );

  const handleItineraryStartDateChange = useCallback(
    (date: string | null) => {
      onChange({ itineraryStartDate: date });
    },
    [onChange],
  );

  const handleItineraryEndDateChange = useCallback(
    (date: string | null) => {
      onChange({ itineraryEndDate: date });
    },
    [onChange],
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Add date and type of the experience
        </h2>
      </div>

      <CommunitySelector
        value={formData.community}
        onCreateNew={() => {
          router.push('/communities/create');
        }}
        communities={communityOptions}
        onChange={handleCommunityChange}
        error={errors.community}
      />

      {/* <ExperienceTypePicker value={formData.experiencePricing} onChange={handlePricingChange} /> */}

      <ExperienceTypeRadio
        value={formData.experienceType}
        onChange={handleTypeChange}
        isRecurring={formData.isRecurring}
        onRecurringChange={handleRecurringChange}
      />

      {formData.experienceType === 'itinerary' ? (
        <ItineraryDateSection
          startDate={formData.itineraryStartDate}
          endDate={formData.itineraryEndDate}
          onStartDateChange={handleItineraryStartDateChange}
          onEndDateChange={handleItineraryEndDateChange}
          errors={errors}
        />
      ) : formData.experienceType === 'multi-day' ? (
        <MultiDayDateSection
          startDate={formData.multiDayStartDate}
          startTime={formData.multiDayStartTime}
          endDate={formData.multiDayEndDate}
          endTime={formData.multiDayEndTime}
          onStartDateChange={handleMultiDayStartDateChange}
          onStartTimeChange={handleMultiDayStartTimeChange}
          onEndDateChange={handleMultiDayEndDateChange}
          onEndTimeChange={handleMultiDayEndTimeChange}
          errors={errors}
        />
      ) : !formData.isRecurring ? (
        <>
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-900">
              Select Experience date(s)
            </label>
            <DatePicker
              value={formData.date || undefined}
              onChange={handleDateChange}
              minDate={new Date()}
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-900">Start Time</label>
              <TimePicker
                value={formData.startTime || undefined}
                onChange={handleStartTimeChange}
                placeholder="Select time"
              />
              {errors.startTime && <p className="mt-1 text-xs text-red-500">{errors.startTime}</p>}
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-900">End Time</label>
              <TimePicker
                value={formData.endTime || undefined}
                onChange={handleEndTimeChange}
                placeholder="Select time"
              />
              {errors.endTime && <p className="mt-1 text-xs text-red-500">{errors.endTime}</p>}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <RecurringDayPicker value={formData.recurringDays} onChange={handleRecurringDaysChange} />
          {errors.recurringDays && <p className="text-xs text-red-500">{errors.recurringDays}</p>}

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
        </div>
      )}
    </div>
  );
};
