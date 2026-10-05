import { Experience } from '@/types/experience';

import {
  addWeeks,
  buildWeek,
  dayKey,
  experienceDayKey,
  experiencesOnDay,
  monthLabel,
  weekStart,
} from './week-strip';

const experience = (id: string, startDate: string): Experience =>
  ({ id, title: id, startDate }) as unknown as Experience;

// 2026-10-07 is a Wednesday
const WEDNESDAY = new Date(2026, 9, 7, 12);

describe('weekStart', () => {
  it('is the Sunday on or before the date', () => {
    expect(dayKey(weekStart(WEDNESDAY))).toBe('2026-10-04');
  });

  it('leaves a Sunday where it is', () => {
    expect(dayKey(weekStart(new Date(2026, 9, 4, 23)))).toBe('2026-10-04');
  });
});

describe('dayKey', () => {
  // Reading the date as UTC would file a 9pm experience in Nairobi under the
  // following day
  it('reads the date locally, not as UTC', () => {
    expect(dayKey(new Date(2026, 9, 7, 23, 30))).toBe('2026-10-07');
  });
});

describe('experienceDayKey', () => {
  it('is the day the experience starts', () => {
    expect(experienceDayKey(experience('e1', '2026-10-07T10:00:00'))).toBe('2026-10-07');
  });

  it('is nothing for a date that cannot be read', () => {
    expect(experienceDayKey(experience('e1', 'whenever'))).toBeNull();
  });
});

describe('buildWeek', () => {
  const week = () =>
    buildWeek(weekStart(WEDNESDAY), [experience('e1', '2026-10-10T09:00:00')], WEDNESDAY);

  it('is seven days from the Sunday', () => {
    const days = week();

    expect(days).toHaveLength(7);
    expect(days[0].key).toBe('2026-10-04');
    expect(days[6].key).toBe('2026-10-10');
  });

  it('labels each day', () => {
    const [sunday] = week();

    expect(sunday.weekday).toBe('Sun');
    expect(sunday.dayOfMonth).toBe('4');
  });

  it('marks the days already gone', () => {
    const days = week();

    expect(days[0].isPast).toBe(true);
    // Today itself is not past
    expect(days[3].isPast).toBe(false);
    expect(days[6].isPast).toBe(false);
  });

  it('dots only the days something is on', () => {
    const days = week();

    expect(days[6].hasExperiences).toBe(true);
    expect(days[5].hasExperiences).toBe(false);
  });
});

describe('experiencesOnDay', () => {
  const list = [
    experience('late', '2026-10-10T15:00:00'),
    experience('early', '2026-10-10T09:00:00'),
    experience('other-day', '2026-10-11T09:00:00'),
  ];

  it('takes only that day, soonest first', () => {
    expect(experiencesOnDay(list, '2026-10-10').map((entry) => entry.id)).toEqual([
      'early',
      'late',
    ]);
  });

  it('is empty for a quiet day', () => {
    expect(experiencesOnDay(list, '2026-10-09')).toEqual([]);
  });
});

describe('monthLabel', () => {
  it('names the month the week sits in', () => {
    expect(monthLabel(buildWeek(weekStart(WEDNESDAY), [], WEDNESDAY))).toBe('October 2026');
  });

  // A week split across two months is named for the one holding most of it
  it('names the majority month on a split week', () => {
    const split = buildWeek(weekStart(new Date(2026, 9, 29)), [], WEDNESDAY);

    expect(split[0].key).toBe('2026-10-25');
    expect(monthLabel(split)).toBe('October 2026');
  });
});

describe('addWeeks', () => {
  it('moves by whole weeks', () => {
    expect(dayKey(addWeeks(weekStart(WEDNESDAY), 1))).toBe('2026-10-11');
    expect(dayKey(addWeeks(weekStart(WEDNESDAY), -1))).toBe('2026-09-27');
  });
});
