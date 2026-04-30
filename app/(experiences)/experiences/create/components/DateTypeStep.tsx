'use client';

import { useCallback, useMemo } from 'react';

import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { CommunitySelector, type Community } from './CommunitySelector';
import { ExperienceTypePicker } from './ExperienceTypePicker';
import { ExperienceTypeRadio } from './ExperienceTypeRadio';

export interface DateTypeFormData {
  community: Community | null;
  experiencePricing: 'paid' | 'free';
  experienceType: 'one-time' | 'multi-day' | 'itinerary';
  isRecurring: boolean;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
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
      onChange({ isRecurring });
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

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Select Experience date(s)
        </label>
        <DatePicker value={formData.date || undefined} onChange={handleDateChange} />
        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Start Time</label>
          <TimePicker
            value={formData.startTime || undefined}
            onChange={handleStartTimeChange}
            placeholder="Select time"
          />
          {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">End Time</label>
          <TimePicker
            value={formData.endTime || undefined}
            onChange={handleEndTimeChange}
            placeholder="Select time"
          />
          {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
        </div>
      </div>
    </div>
  );
};
