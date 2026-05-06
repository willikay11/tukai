'use client';

import { useMemo } from 'react';

type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

interface RecurrencePreviewLabelProps {
  selectedDays: DayOfWeek[];
  startDate: string | null;
}

const DAY_NAMES = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAY_INDICES = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};

const getFirstOccurrence = (
  startDate: string,
  selectedDays: DayOfWeek[],
): { dayName: string; day: number; month: string } | null => {
  try {
    const [year, month, day] = startDate.split('-').map(Number);
    let checkDate = new Date(year, month - 1, day);

    for (let i = 0; i < 7; i++) {
      const dayOfWeek = checkDate.getDay();
      const selectedDay = selectedDays.find((d) => DAY_INDICES[d] === dayOfWeek);

      if (selectedDay) {
        const dayName = DAY_NAMES[selectedDay];
        const dayNum = checkDate.getDate();
        const monthName = MONTH_NAMES[checkDate.getMonth()];

        return { dayName, day: dayNum, month: monthName };
      }

      checkDate.setDate(checkDate.getDate() + 1);
    }

    return null;
  } catch {
    return null;
  }
};

export const RecurrencePreviewLabel = ({
  selectedDays,
  startDate,
}: RecurrencePreviewLabelProps) => {
  const firstOccurrence = useMemo(() => {
    if (!startDate || selectedDays.length === 0) {
      return null;
    }
    return getFirstOccurrence(startDate, selectedDays);
  }, [startDate, selectedDays]);

  if (!firstOccurrence) {
    return null;
  }

  return (
    <div className="w-fit rounded-full bg-blue-100 px-4 py-2 text-xs font-normal italic border-[1px] border-blue-300 text-gray-500">
      Your first experience will be on {firstOccurrence.dayName}, {firstOccurrence.day}{' '}
      {firstOccurrence.month}
    </div>
  );
};
