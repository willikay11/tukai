'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import moment from 'moment';
import { getOrdinalDate } from '@/utils/date-utils';

type PreviewDateSectionProps =
  | {
      mode: 'single';
      date: string | null;
      startTime: string | null;
      endTime: string | null;
      onEdit?: () => void;
    }
  | {
      mode: 'recurring';
      days: string[];
      timeSlots: { startTime: string | null; endTime: string | null }[];
      recurrenceStartDate: string | null;
      recurrenceEndDate: string | null;
      onEdit?: () => void;
    }
  | {
      mode: 'multi-day';
      startDate: string | null;
      startTime: string | null;
      endDate: string | null;
      endTime: string | null;
      onEdit?: () => void;
    };

const formatTime = (time: string | null) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const period = hour >= 12 ? 'PM' : 'AM';
  return `${displayHour}:${minutes} ${period}`;
};

const formatDays = (days: string[]): string => {
  const dayNames: Record<string, string> = {
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',
  };

  const formattedDays = days.map((day) => dayNames[day] || day);

  if (formattedDays.length === 0) return '';
  if (formattedDays.length === 1) return formattedDays[0];

  const lastDay = formattedDays[formattedDays.length - 1];
  const otherDays = formattedDays.slice(0, -1).join(', ');
  return `${otherDays} & ${lastDay}`;
};

export const PreviewDateSection = (props: PreviewDateSectionProps) => {
  if (props.mode === 'single') {
    const timeRange =
      props.startTime && props.endTime ? `${formatTime(props.startTime)} - ${formatTime(props.endTime)}` : '';

    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-xs font-semibold text-gray-900">Date of the Experience</h3>
          {props.onEdit && (
            <button onClick={props.onEdit} className="text-gray-400 hover:text-gray-600">
              <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
            </button>
          )}
        </div>
        {props.date && timeRange ? (
          <div className="flex items-center gap-2">
            <div className="bg-lime rounded-[12px] p-4">
              <IconComponent iconName="CalendarAdd01Icon" size={28} className="text-emerald-600" />
            </div>
            <div className="text-xs text-gray-700">
              <span className="font-medium text-gray-800">{moment(props.date).format('ddd, MMM D')}</span>
              <span className="text-xs font-medium text-gray-800">&nbsp;{timeRange}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500">Not selected yet</p>
        )}
      </div>
    );
  }

  if (props.mode === 'multi-day') {
    const startTimeFormatted = formatTime(props.startTime);
    const endTimeFormatted = formatTime(props.endTime);
    const startDateFormatted = props.startDate ? moment(props.startDate).format('MMM D, YYYY') : '';
    const endDateFormatted = props.endDate ? moment(props.endDate).format('MMM D, YYYY') : '';

    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-xs font-semibold text-gray-900">Date of the Experience</h3>
          {props.onEdit && (
            <button onClick={props.onEdit} className="text-gray-400 hover:text-gray-600">
              <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
            </button>
          )}
        </div>
        {props.startDate && props.endDate && startTimeFormatted && endTimeFormatted ? (
          <div className="flex items-center gap-2">
            <div className="bg-lime rounded-[12px] p-4">
              <IconComponent iconName="CalendarAdd01Icon" size={28} className="text-emerald-600" />
            </div>
            <div className="text-xs text-gray-700 space-y-1">
              <div className="font-medium text-gray-800">
                {startDateFormatted} – {endDateFormatted}
              </div>
              <div className="text-gray-600">
                {startTimeFormatted} – {endTimeFormatted}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-500">Not selected yet</p>
        )}
      </div>
    );
  }

  if (props.mode !== 'recurring') {
    return null;
  }

  const firstSlot = props.timeSlots[0];
  const firstTimeRange =
    firstSlot && firstSlot.startTime && firstSlot.endTime
      ? `${formatTime(firstSlot.startTime)} – ${formatTime(firstSlot.endTime)}`
      : '';

  const daysLabel = formatDays(props.days);
  const dateRange =
    props.recurrenceStartDate && props.recurrenceEndDate
      ? `From ${getOrdinalDate(props.recurrenceStartDate)} – ${getOrdinalDate(props.recurrenceEndDate)}`
      : '';

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Date of the Experience</h3>
        {props.onEdit && (
          <button onClick={props.onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
          </button>
        )}
      </div>
      {daysLabel && firstTimeRange ? (
        <div className="flex items-center gap-2">
          <div className="bg-lime rounded-[12px] p-4">
            <IconComponent iconName="CalendarAdd01Icon" size={28} className="text-emerald-600" />
          </div>
          <div className="text-xs text-gray-700 space-y-1">
            <div>
              <span className="font-medium text-gray-800">Every {daysLabel},</span>
              <span className="font-medium text-gray-800">&nbsp;{firstTimeRange}</span>
            </div>
            {dateRange && <div className="text-gray-600">{dateRange}</div>}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not selected yet</p>
      )}
    </div>
  );
};
