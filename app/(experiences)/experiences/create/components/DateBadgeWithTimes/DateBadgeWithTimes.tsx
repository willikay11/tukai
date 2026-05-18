'use client';

import { TimePicker } from '@/components/ui/time-picker';
import { TicketDateBadge } from '../TicketDateBadge/TicketDateBadge';

interface DateBadgeWithTimesProps {
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
}

export const DateBadgeWithTimes = ({
  startDate,
  endDate,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: DateBadgeWithTimesProps) => {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-6">
      <div className="w-full lg:w-3/5">
        {startDate && endDate ? (
          <TicketDateBadge
            mode="multi-day-range"
            startDate={startDate}
            endDate={endDate}
          />
        ) : null}
      </div>

      <div className="flex w-full gap-3 lg:w-2/5">
        <div className="flex-1">
          <TimePicker
            value={startTime || undefined}
            onChange={onStartTimeChange}
            placeholder="Start Time"
          />
        </div>

        <div className="flex-1">
          <TimePicker
            value={endTime || undefined}
            onChange={onEndTimeChange}
            placeholder="End Time"
          />
        </div>
      </div>
    </div>
  );
};
