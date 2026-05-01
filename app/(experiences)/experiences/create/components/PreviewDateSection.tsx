'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import moment from 'moment';

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


  const timeRange = startTime && endTime ? `${formatTime(startTime)} - ${formatTime(endTime)}` : '';

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Date of the Experience</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className='text-gray-800' />
          </button>
        )}
      </div>
      {date && timeRange ? (
        <div className="flex items-center gap-2">
          <div className='bg-lime rounded-[12px] p-4'>
            <IconComponent iconName="CalendarAdd01Icon" size={28} className="text-emerald-600" />
          </div>
          <div className="text-xs text-gray-700">
            <span className="font-medium text-gray-800">{moment(date).format('ddd, MMM D')}</span>
            <span className="text-xs font-medium text-gray-800">&nbsp;{timeRange}</span>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not selected yet</p>
      )}
    </div>
  );
};
