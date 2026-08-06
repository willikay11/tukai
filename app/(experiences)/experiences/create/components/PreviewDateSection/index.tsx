'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { formatFullDayLabel, toWeekdayIndex } from '@/utils/recurrence-utils';

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

// The recurring view mirrors the customer's booking picker
// (RecurringDateSlotPicker): the strip starts today — or the recurrence start,
// whichever is later — and runs to the recurrence end, capped at 30 days.
const MAX_STRIP_DAYS = 30;

const buildDateStrip = (days: string[], startDate: string | null, endDate: string | null) => {
  const weekdays = days.map(toWeekdayIndex).filter((index): index is number => index !== null);

  if (weekdays.length === 0) return [];

  const start = moment.max(
    moment().startOf('day'),
    startDate ? moment(startDate).startOf('day') : moment().startOf('day'),
  );
  const end = endDate
    ? moment(endDate).startOf('day')
    : start.clone().add(MAX_STRIP_DAYS - 1, 'days');

  const strip: { date: string; enabled: boolean }[] = [];
  const cursor = start.clone();

  while (cursor.isSameOrBefore(end) && strip.length < MAX_STRIP_DAYS) {
    strip.push({
      date: cursor.format('YYYY-MM-DD'),
      enabled: weekdays.includes(cursor.day()),
    });
    cursor.add(1, 'day');
  }

  return strip;
};

export const PreviewDateSection = (props: PreviewDateSectionProps) => {
  if (props.mode === 'single') {
    const timeRange =
      props.startTime && props.endTime
        ? `${formatTime(props.startTime)} - ${formatTime(props.endTime)}`
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
        {props.date && timeRange ? (
          <div className="flex items-center gap-2">
            <div className="rounded-[12px] bg-lime p-4">
              <IconComponent iconName="CalendarAdd01Icon" size={28} className="text-emerald-600" />
            </div>
            <div className="text-xs text-gray-700">
              <span className="font-medium text-gray-800">
                {moment(props.date).format('ddd, MMM D')}
              </span>
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
            <div className="rounded-[12px] bg-lime p-4">
              <IconComponent iconName="CalendarAdd01Icon" size={28} className="text-emerald-600" />
            </div>
            <div className="space-y-1 text-xs text-gray-700">
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

  // Same label format as the customer's slot pills: "9:00 AM - 5:00 PM"
  const timeRanges = props.timeSlots
    .filter((slot) => slot.startTime && slot.endTime)
    .map((slot) => `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`);

  const daysLabel = formatFullDayLabel(props.days);
  const strip = buildDateStrip(props.days, props.recurrenceStartDate, props.recurrenceEndDate);
  // Every date the experience actually runs on is shown in the selected green;
  // the rest are dimmed. Only the month label keys off the first one.
  const firstEnabledDate = strip.find((day) => day.enabled)?.date ?? null;
  const monthLabel = moment(firstEnabledDate ?? props.recurrenceStartDate ?? undefined).format(
    'MMMM YYYY',
  );

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
      {daysLabel && timeRanges.length > 0 ? (
        <div className="space-y-3">
          <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-gray-900">{monthLabel}</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-primary">
                Recurs Every {daysLabel}
              </span>
            </div>

            {strip.length === 0 ? (
              <p className="text-xs text-gray-500">No upcoming dates for this experience.</p>
            ) : (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {strip.map((day) => (
                  <div
                    key={day.date}
                    className={`flex flex-shrink-0 flex-col items-center gap-1 rounded-2xl px-4 py-3 text-center ${
                      day.enabled ? 'bg-emerald-100 text-primary' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <span className="text-xs">{moment(day.date).format('ddd')}</span>
                    <span className="text-base font-semibold">{moment(day.date).format('D')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {timeRanges.map((timeRange, index) => (
              <div
                key={index}
                className={`rounded-full px-5 py-3 text-xs font-normal ${
                  index === 0
                    ? 'bg-gradient-to-b from-[#047857] to-[#064E3B] text-white shadow-md'
                    : 'border border-gray-200 bg-white text-gray-900'
                }`}
              >
                {timeRange}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not selected yet</p>
      )}
    </div>
  );
};
