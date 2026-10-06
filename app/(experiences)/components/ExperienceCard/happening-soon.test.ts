import { Experience } from '@/types/experience';

import { SOON_LIMIT, hasMoreSoon, happeningSoon, nextStart } from './happening-soon';

// A Thursday
const NOW = new Date(2026, 9, 1, 12, 0);

const iso = (date: Date) => date.toISOString();
const daysFromNow = (days: number, hour = 10) => new Date(2026, 9, 1 + days, hour, 0);

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Pottery for beginners',
    startDate: iso(daysFromNow(2)),
    endDate: iso(daysFromNow(2, 12)),
    ...overrides,
  }) as unknown as Experience;

describe('nextStart', () => {
  it('is the start date of a one-off still to come', () => {
    expect(nextStart(experience(), NOW)?.getTime()).toBe(daysFromNow(2).getTime());
  });

  // A hike that started at 9 and runs until 2 is happening, not past
  it('keeps one already under way', () => {
    const running = experience({
      startDate: iso(new Date(2026, 9, 1, 9)),
      endDate: iso(new Date(2026, 9, 1, 14)),
    });
    expect(nextStart(running, NOW)).not.toBeNull();
  });

  it('drops one that has finished', () => {
    const over = experience({
      startDate: iso(daysFromNow(-3)),
      endDate: iso(daysFromNow(-3, 12)),
    });
    expect(nextStart(over, NOW)).toBeNull();
  });

  // The series start is when it began, which can be months back - the rule is
  // what says when it next runs
  it('reads a recurring one off its rule, not its start date', () => {
    const weekly = experience({
      startDate: iso(new Date(2026, 0, 3, 10)),
      recurrenceRule: 'DTSTART=20260103T100000Z;FREQ=WEEKLY;BYDAY=SA',
    });
    const next = nextStart(weekly, NOW);
    // The first Saturday after Thursday 1 Oct 2026 is the 3rd
    expect(next?.getUTCDate()).toBe(3);
    expect(next?.getUTCMonth()).toBe(9);
  });

  it('drops a series that has already ended', () => {
    const finished = experience({
      recurrenceRule: 'DTSTART=20260103T100000Z;FREQ=WEEKLY;BYDAY=SA;UNTIL=20260301T100000Z',
    });
    expect(nextStart(finished, NOW)).toBeNull();
  });

  it('drops one whose rule cannot be read', () => {
    expect(nextStart(experience({ recurrenceRule: 'not a rule' }), NOW)).toBeNull();
  });

  it('drops one with no usable start date', () => {
    expect(nextStart(experience({ startDate: 'tomorrow-ish' }), NOW)).toBeNull();
  });
});

describe('happeningSoon', () => {
  it('keeps only what falls inside the fortnight', () => {
    const soon = experience({ id: 'soon', startDate: iso(daysFromNow(3)) });
    const later = experience({
      id: 'later',
      startDate: iso(daysFromNow(20)),
      endDate: iso(daysFromNow(20, 12)),
    });

    expect(happeningSoon([soon, later], NOW).map((entry) => entry.id)).toEqual(['soon']);
  });

  it('puts the soonest first', () => {
    const list = [5, 1, 9].map((days) =>
      experience({
        id: `d${days}`,
        startDate: iso(daysFromNow(days)),
        endDate: iso(daysFromNow(days, 12)),
      }),
    );

    expect(happeningSoon(list, NOW).map((entry) => entry.id)).toEqual(['d1', 'd5', 'd9']);
  });

  // A weekly thing that began in January belongs where it next runs, not at
  // the front of the rail
  it('sorts a recurring one by its next run', () => {
    const weekly = experience({
      id: 'weekly',
      startDate: iso(new Date(2026, 0, 3, 10)),
      recurrenceRule: 'DTSTART=20260103T100000Z;FREQ=WEEKLY;BYDAY=SA',
    });
    const tomorrow = experience({
      id: 'tomorrow',
      startDate: iso(daysFromNow(1)),
      endDate: iso(daysFromNow(1, 12)),
    });

    expect(happeningSoon([weekly, tomorrow], NOW).map((entry) => entry.id)).toEqual([
      'tomorrow',
      'weekly',
    ]);
  });

  it('shows at most nine, leaving the rest to the See All tile', () => {
    const list = Array.from({ length: 14 }, (_, index) =>
      experience({
        id: `e${index}`,
        startDate: iso(daysFromNow(index % 10)),
        endDate: iso(daysFromNow(index % 10, 12)),
      }),
    );

    expect(happeningSoon(list, NOW)).toHaveLength(SOON_LIMIT);
  });

  it('is empty when nothing is coming up', () => {
    expect(happeningSoon([], NOW)).toEqual([]);
  });
});

describe('hasMoreSoon', () => {
  const fortnightOf = (count: number) =>
    Array.from({ length: count }, (_, index) =>
      experience({
        id: `e${index}`,
        startDate: iso(daysFromNow(index % 10)),
        endDate: iso(daysFromNow(index % 10, 12)),
      }),
    );

  // The See All tile only earns its place when the rail is leaving some out
  it('is false when everything in the fortnight fits on the rail', () => {
    expect(hasMoreSoon(fortnightOf(SOON_LIMIT), NOW)).toBe(false);
    expect(hasMoreSoon(fortnightOf(3), NOW)).toBe(false);
  });

  it('is true when the fortnight holds more than the rail shows', () => {
    expect(hasMoreSoon(fortnightOf(SOON_LIMIT + 1), NOW)).toBe(true);
  });

  it('ignores experiences outside the fortnight', () => {
    const later = experience({ id: 'later', startDate: iso(daysFromNow(30)) });

    expect(hasMoreSoon([...fortnightOf(SOON_LIMIT), later], NOW)).toBe(false);
  });

  it('is false when nothing is coming up', () => {
    expect(hasMoreSoon([], NOW)).toBe(false);
  });
});
