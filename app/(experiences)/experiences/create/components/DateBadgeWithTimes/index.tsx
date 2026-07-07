'use client';

import { TicketDateBadge } from '../TicketDateBadge';
import { TimePill } from '../TimePill';

interface DateBadgeWithTimesProps {
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
}

export const DateBadgeWithTimes = ({
  startDate,
  endDate,
  startTime,
  endTime,
}: DateBadgeWithTimesProps) => {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
      <div className="w-fit">
        {startDate && endDate ? (
          <TicketDateBadge mode="multi-day-range" startDate={startDate} endDate={endDate} />
        ) : null}
      </div>

      {startTime && endTime ? (
        <div className="w-fit">
          <TimePill startTime={startTime} endTime={endTime} onClick={() => {}} />
        </div>
      ) : null}
    </div>
  );
};
