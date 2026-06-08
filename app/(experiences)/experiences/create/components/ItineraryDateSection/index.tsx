'use client';

import { useCallback } from 'react';

import { DatePicker } from '@/components/ui/date-picker';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { IconComponent } from '@/app/shared/components/Icons';
import { formatFirstExperienceDate } from '@/utils/date-utils';

interface ItineraryDateSectionProps {
  itineraryMode: 'fixed' | 'open' | null;
  itineraryStartDate: string | null;
  itineraryEndDate: string | null;
  itineraryDurationDays: number | null;
  onModeChange: (mode: 'fixed' | 'open') => void;
  onStartDateChange: (date: string | null) => void;
  onEndDateChange: (date: string | null) => void;
  onDurationDaysChange: (days: number | null) => void;
  errors: Record<string, string>;
}

export const ItineraryDateSection = ({
  itineraryMode,
  itineraryStartDate,
  itineraryEndDate,
  itineraryDurationDays,
  onModeChange,
  onStartDateChange,
  onEndDateChange,
  onDurationDaysChange,
  errors,
}: ItineraryDateSectionProps) => {
  const modeOptions = [
    { value: 'fixed', label: 'Specific Dates' },
    { value: 'open', label: 'Flexible Dates' },
  ];

  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      onDurationDaysChange(value ? Number(value) : null);
    },
    [onDurationDaysChange],
  );

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-900">
          How flexible are the travel dates?
        </label>
        {itineraryMode && (
          <PillRadioGroup
            options={modeOptions}
            value={itineraryMode}
            onChange={(value) => onModeChange(value as 'fixed' | 'open')}
          />
        )}
      </div>

      {/* Fixed mode - Specific Dates */}
      {itineraryMode === 'fixed' && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-800">
            Select itinerary dates
          </label>

          {/* Start Date + End Date side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <DatePicker
                value={itineraryStartDate || undefined}
                onChange={onStartDateChange}
                placeholder="Start Date"
                minDate={new Date()}
              />
              {errors.itineraryStartDate && (
                <p className="mt-1 text-xs text-red-500">{errors.itineraryStartDate}</p>
              )}
            </div>
            <div>
              <DatePicker
                value={itineraryEndDate || undefined}
                onChange={onEndDateChange}
                placeholder="End Date"
                minDate={itineraryStartDate ? new Date(itineraryStartDate) : new Date()}
              />
              {errors.itineraryEndDate && (
                <p className="mt-1 text-xs text-red-500">{errors.itineraryEndDate}</p>
              )}
            </div>
          </div>

          {/* Preview label - first experience date */}
          {itineraryStartDate && (
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-200">
              <IconComponent
                iconName="Calendar03Icon"
                size={14}
                className="text-blue-600"
              />
              <span>
                Your first experience will be on {formatFirstExperienceDate(itineraryStartDate)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Open mode - Flexible Dates */}
      {itineraryMode === 'open' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-800">
            Validity Window
            <span className="ml-1 text-xs font-normal text-gray-500">
              (When can buyers choose their departure date)
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <DatePicker
                value={itineraryStartDate || undefined}
                onChange={onStartDateChange}
                placeholder="Window Opens"
                minDate={new Date()}
              />
              {errors.itineraryStartDate && (
                <p className="mt-1 text-xs text-red-500">{errors.itineraryStartDate}</p>
              )}
            </div>
            <div>
              <DatePicker
                value={itineraryEndDate || undefined}
                onChange={onEndDateChange}
                placeholder="Window Closes"
                minDate={itineraryStartDate ? new Date(itineraryStartDate) : new Date()}
              />
              {errors.itineraryEndDate && (
                <p className="mt-1 text-xs text-red-500">{errors.itineraryEndDate}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Duration days - both modes */}
      {itineraryMode && (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-800">
            How many days does this itinerary last?
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={365}
              value={itineraryDurationDays ?? ''}
              onChange={handleDurationChange}
              placeholder="e.g. 4"
              className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-sm text-gray-500">days</span>
          </div>
          {errors.itineraryDurationDays && (
            <p className="text-xs text-red-500">{errors.itineraryDurationDays}</p>
          )}
        </div>
      )}
    </div>
  );
};
