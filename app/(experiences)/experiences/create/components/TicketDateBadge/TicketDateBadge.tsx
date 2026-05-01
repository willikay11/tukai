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
    <div className="flex items-center gap-2 rounded-lg border border-dashed border-emerald-400 bg-emerald-50 px-3 py-2.5">
      <IconComponent iconName="Calendar01Icon" size={18} className="text-emerald-600" />
      <div className="text-xs text-gray-700">
        <p className="font-medium">Date: {formatDate(date)} · {timeRange}</p>
      </div>
      <IconComponent iconName="CheckmarkBadge01Icon" size={18} className="ml-auto text-emerald-600" />
    </div>
  );
};
