'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { formatDateDDMMYYYY } from '@/utils/date-utils';

type TicketDateBadgeProps =
  | {
      mode: 'single';
      date: string;
      startTime: string;
      endTime: string;
    }
  | {
      mode: 'recurring';
      days: string[];
      startTime: string;
      endTime: string;
    }
  | {
      mode: 'multi-day-range';
      startDate: string;
      endDate: string;
    };

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
  return formattedDays.join(', ');
};

export const TicketDateBadge = (props: TicketDateBadgeProps) => {
  if (props.mode === 'single') {
    const timeRange = `${formatTime(props.startTime)} – ${formatTime(props.endTime)}`;
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-emerald-500 bg-emerald-100 px-5 py-3">
        <IconComponent
          iconName="Calendar04Icon"
          size={20}
          className="flex-shrink-0 text-emerald-700"
        />
        <p className="whitespace-nowrap text-xs font-medium text-primary">
          Date: {formatDate(props.date)} · {timeRange}
        </p>
        <IconComponent
          iconName="ArrowDown01Icon"
          size={20}
          className="flex-shrink-0 text-emerald-700"
        />
      </div>
    );
  }

  if (props.mode === 'recurring') {
    const timeRange = `${formatTime(props.startTime)} – ${formatTime(props.endTime)}`;
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-emerald-500 bg-emerald-100 px-5 py-3">
        <IconComponent
          iconName="Calendar04Icon"
          size={20}
          className="flex-shrink-0 text-emerald-700"
        />
        <p className="whitespace-nowrap text-xs font-medium text-primary">
          Every {formatDays(props.days)} {timeRange}
        </p>
        <IconComponent
          iconName="ArrowDown01Icon"
          size={20}
          className="flex-shrink-0 text-emerald-700"
        />
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-dashed border-emerald-500 bg-emerald-100 px-5 py-3">
      <IconComponent
        iconName="Calendar04Icon"
        size={20}
        className="flex-shrink-0 text-emerald-700"
      />
      <p className="whitespace-nowrap text-xs font-medium text-primary">
        Date: {formatDateDDMMYYYY(props.startDate)} – {formatDateDDMMYYYY(props.endDate)}
      </p>
      <IconComponent
        iconName="CheckCircle2Icon"
        size={20}
        className="flex-shrink-0 text-emerald-700"
      />
    </div>
  );
};
