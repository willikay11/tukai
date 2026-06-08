'use client';

import { DatePicker } from '@/components/ui/date-picker';
import { formatItineraryDateRange, getNumberOfDaysAndNights } from '@/utils/date-utils';

interface ItineraryDateSectionProps {
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (date: string | null) => void;
  onEndDateChange: (date: string | null) => void;
  errors: Record<string, string>;
}

export const ItineraryDateSection = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  errors,
}: ItineraryDateSectionProps) => {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-gray-800">Select itinerary date(s)</label>

      {/* Start + End date pickers side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <DatePicker
            value={startDate || undefined}
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
            value={endDate || undefined}
            onChange={onEndDateChange}
            placeholder="End Date"
            minDate={startDate ? new Date(startDate) : new Date()}
          />
          {errors.itineraryEndDate && (
            <p className="mt-1 text-xs text-red-500">{errors.itineraryEndDate}</p>
          )}
        </div>
      </div>

      {/* Preview label — only when both dates set */}
      {startDate && endDate && (
        <div className="inline-flex items-center space-x-2 rounded-full bg-blue-50 px-4 py-2 text-xs italic text-gray-500">
          <span className="font-medium">Experience Duration:</span>
          <span>{formatItineraryDateRange(startDate, endDate)}</span>
          <div className="h-1 w-1 rounded-full bg-gray-500" />
          <span>
            {getNumberOfDaysAndNights(startDate, endDate).days} days {' '}
            {getNumberOfDaysAndNights(startDate, endDate).nights} nights
          </span>
        </div>
      )}
    </div>
  );
};
