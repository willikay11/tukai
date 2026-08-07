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
    }
  | {
      // Same run-of-days view as multi-day. Times live on the individual
      // activities, so there is no overall time range to show.
      mode: 'itinerary';
      startDate: string | null;
      endDate: string | null;
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

// The date strip mirrors the customer's booking picker
// (RecurringDateSlotPicker): it starts today — or the experience start,
// whichever is later — and runs to the end date, capped at 30 days.
const MAX_STRIP_DAYS = 30;

// Days shown either side of a multi-day run, for context
const CONTEXT_DAYS = 3;

interface StripDay {
  date: string;
  enabled: boolean;
}

const buildStrip = (
  startDate: string | null,
  endDate: string | null,
  isEnabled: (date: moment.Moment) => boolean,
  // Recurring experiences run open-ended, so their strip lists upcoming dates
  // only — the same window the customer can book. A multi-day experience is a
  // fixed run, so it shows all of its dates whether or not they have passed.
  { fromToday = false }: { fromToday?: boolean } = {},
): StripDay[] => {
  const rangeStart = startDate ? moment(startDate).startOf('day') : moment().startOf('day');
  const start = fromToday ? moment.max(moment().startOf('day'), rangeStart) : rangeStart;
  const end = endDate
    ? moment(endDate).startOf('day')
    : start.clone().add(MAX_STRIP_DAYS - 1, 'days');

  const strip: StripDay[] = [];
  const cursor = start.clone();

  while (cursor.isSameOrBefore(end) && strip.length < MAX_STRIP_DAYS) {
    strip.push({ date: cursor.format('YYYY-MM-DD'), enabled: isEnabled(cursor) });
    cursor.add(1, 'day');
  }

  return strip;
};

/**
 * The shared date-strip view: month label, a chip describing the pattern, the
 * run of dates (active ones in green) and a pill per time range. Used for both
 * recurring and multi-day experiences.
 */
const DateStripView = ({
  chipLabel,
  strip,
  timeRanges,
  fallbackDate,
  onEdit,
}: {
  chipLabel: string;
  strip: StripDay[];
  timeRanges: string[];
  fallbackDate: string | null;
  onEdit?: () => void;
}) => {
  const firstEnabledDate = strip.find((day) => day.enabled)?.date ?? null;
  const monthLabel = moment(firstEnabledDate ?? fallbackDate ?? undefined).format('MMMM YYYY');

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Date of the Experience</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-gray-900">{monthLabel}</p>
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-primary">
              {chipLabel}
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
    </div>
  );
};

const EmptyDateSection = ({ onEdit }: { onEdit?: () => void }) => (
  <div className="space-y-3">
    <div className="flex items-start justify-between">
      <h3 className="text-xs font-semibold text-gray-900">Date of the Experience</h3>
      {onEdit && (
        <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
          <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
        </button>
      )}
    </div>
    <p className="text-xs text-gray-500">Not selected yet</p>
  </div>
);

/**
 * A fixed run of consecutive days — multi-day and itinerary experiences. Every
 * date in the run is active, padded either side with a few surrounding days for
 * context, the way the off-days read in the recurring strip.
 */
const DateRunView = ({
  startDate,
  endDate,
  timeRanges,
  onEdit,
}: {
  startDate: string;
  endDate: string;
  timeRanges: string[];
  onEdit?: () => void;
}) => {
  const runStart = moment(startDate).startOf('day');
  const runEnd = moment(endDate).startOf('day');
  const totalDays = runEnd.diff(runStart, 'days') + 1;

  // The padding gives way to the run itself when a long one would otherwise be
  // cut off by the 30-day cap
  const padding = Math.max(0, Math.min(CONTEXT_DAYS, Math.floor((MAX_STRIP_DAYS - totalDays) / 2)));

  return (
    <DateStripView
      chipLabel={`Runs for ${totalDays} ${totalDays === 1 ? 'Day' : 'Days'}`}
      strip={buildStrip(
        runStart.clone().subtract(padding, 'days').format('YYYY-MM-DD'),
        runEnd.clone().add(padding, 'days').format('YYYY-MM-DD'),
        (date) => date.isBetween(runStart, runEnd, 'day', '[]'),
      )}
      timeRanges={timeRanges}
      fallbackDate={startDate}
      onEdit={onEdit}
    />
  );
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
    const isComplete = Boolean(
      props.startDate && props.endDate && startTimeFormatted && endTimeFormatted,
    );

    if (!isComplete) {
      return <EmptyDateSection onEdit={props.onEdit} />;
    }

    return (
      <DateRunView
        startDate={props.startDate as string}
        endDate={props.endDate as string}
        timeRanges={[`${startTimeFormatted} - ${endTimeFormatted}`]}
        onEdit={props.onEdit}
      />
    );
  }

  if (props.mode === 'itinerary') {
    if (!props.startDate || !props.endDate) {
      return <EmptyDateSection onEdit={props.onEdit} />;
    }

    // Activity times are shown on the itinerary section itself, so this run
    // carries no time pills
    return (
      <DateRunView
        startDate={props.startDate}
        endDate={props.endDate}
        timeRanges={[]}
        onEdit={props.onEdit}
      />
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
  const weekdays = props.days
    .map(toWeekdayIndex)
    .filter((index): index is number => index !== null);

  if (!daysLabel || weekdays.length === 0 || timeRanges.length === 0) {
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
        <p className="text-xs text-gray-500">Not selected yet</p>
      </div>
    );
  }

  return (
    <DateStripView
      chipLabel={`Recurs Every ${daysLabel}`}
      strip={buildStrip(
        props.recurrenceStartDate,
        props.recurrenceEndDate,
        (date) => weekdays.includes(date.day()),
        { fromToday: true },
      )}
      timeRanges={timeRanges}
      fallbackDate={props.recurrenceStartDate}
      onEdit={props.onEdit}
    />
  );
};
