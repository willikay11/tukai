'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { formatTimeTo12Hour } from '@/utils/date-utils';

export interface TimePillProps {
  startTime: string;
  endTime: string;
  onClick: () => void;
}

export const TimePill = ({ startTime, endTime, onClick }: TimePillProps) => {
  const formattedStart = formatTimeTo12Hour(startTime);
  const formattedEnd = formatTimeTo12Hour(endTime);

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-dashed border-emerald-500 bg-emerald-100 px-5 py-3 transition-opacity hover:opacity-90"
    >
      <IconComponent iconName="Clock02Icon" size={20} className="flex-shrink-0 text-emerald-700" />
      <p className="whitespace-nowrap text-xs font-medium text-primary">
        {formattedStart} - {formattedEnd}
      </p>
      <IconComponent iconName="Edit02Icon" size={20} className="flex-shrink-0 text-emerald-700" />
    </button>
  );
};
