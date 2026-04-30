'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewDateSectionProps {
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  onEdit?: () => void;
}

export const PreviewDateSection = ({ date, startTime, endTime, onEdit }: PreviewDateSectionProps) => {
  const formatTime = (time: string | null) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${minutes} ${period}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const timeRange = startTime && endTime ? `${formatTime(startTime)} - ${formatTime(endTime)}` : '';

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Date of the Experience</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>
      {date && timeRange ? (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5">
          <IconComponent iconName="Calendar01Icon" size={18} className="text-emerald-600" />
          <div className="text-xs text-gray-700">
            <p className="font-medium">{formatDate(date)}</p>
            <p className="text-gray-600">{timeRange}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not selected yet</p>
      )}
    </div>
  );
};
