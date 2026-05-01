'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface TicketDateBadgeProps {
  date: string;
  startTime: string;
  endTime: string;
}

const formatTime = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${displayHour}:${minutes} ${period}`;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

export const TicketDateBadge = ({ date, startTime, endTime }: TicketDateBadgeProps) => {
  const timeRange = startTime && endTime ? `${formatTime(startTime)} – ${formatTime(endTime)}` : '';

  return (
    <div className="flex w-fit items-center gap-2 rounded-full border border-dashed border-emerald-500 bg-emerald-100 px-5 py-3">
      <IconComponent iconName="Calendar04Icon" size={20} className="text-emerald-700" />
      <p className="text-xs font-medium text-primary">
        Date: {formatDate(date)} - {timeRange}
      </p>
      <IconComponent iconName="ArrowDown01Icon" size={20} className="ml-1 text-emerald-700" />
    </div>
  );
};
