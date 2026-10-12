import { Experience } from '@/types/experience';

import { QUICK_DATES, TIME_OF_DAY, matchesQuickDate, matchesTimeOfDay } from './when';

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Sunrise hike',
    startDate: '2026-10-05T06:00:00Z',
    endDate: '2026-10-05T10:00:00Z',
    ...overrides,
  }) as unknown as Experience;

// A fixed instant to read "today"/"tomorrow"/"this weekend" against. A Monday,
// so the coming weekend is still ahead of it.
const NOW = new Date('2026-10-05T12:00:00');

describe('QUICK_DATES', () => {
  it('offers the canvas four, in its order and its words', () => {
    expect(QUICK_DATES.map((option) => option.label)).toEqual([
      'Today',
      'Tomorrow',
      'This weekend',
      'Next 7 days',
    ]);
  });
});

describe('TIME_OF_DAY', () => {
  it('offers the canvas three bands, in its order and its words', () => {
    expect(TIME_OF_DAY.map((band) => band.label)).toEqual(['Morning', 'Afternoon', 'Evening']);
  });
});

describe('matchesQuickDate', () => {
  it('keeps everything when nothing is picked', () => {
    expect(matchesQuickDate(experience(), undefined, NOW)).toBe(true);
  });

  it('keeps today out of tomorrow', () => {
    expect(matchesQuickDate(experience({ startDate: '2026-10-05T06:00:00Z' }), 'today', NOW)).toBe(
      true,
    );
    expect(
      matchesQuickDate(experience({ startDate: '2026-10-06T06:00:00Z' }), 'today', NOW),
    ).toBe(false);
  });

  it('keeps tomorrow out of today', () => {
    expect(
      matchesQuickDate(experience({ startDate: '2026-10-06T06:00:00Z' }), 'tomorrow', NOW),
    ).toBe(true);
    expect(
      matchesQuickDate(experience({ startDate: '2026-10-05T06:00:00Z' }), 'tomorrow', NOW),
    ).toBe(false);
  });

  it('spans the coming Saturday and Sunday for this weekend', () => {
    // NOW is a Monday, so the weekend is four and five days out
    expect(
      matchesQuickDate(experience({ startDate: '2026-10-10T09:00:00Z' }), 'weekend', NOW),
    ).toBe(true);
    expect(
      matchesQuickDate(experience({ startDate: '2026-10-11T09:00:00Z' }), 'weekend', NOW),
    ).toBe(true);
    expect(
      matchesQuickDate(experience({ startDate: '2026-10-09T09:00:00Z' }), 'weekend', NOW),
    ).toBe(false);
  });

  it('spans the next seven days', () => {
    expect(
      matchesQuickDate(experience({ startDate: '2026-10-11T09:00:00Z' }), 'next7', NOW),
    ).toBe(true);
    expect(
      matchesQuickDate(experience({ startDate: '2026-10-13T09:00:00Z' }), 'next7', NOW),
    ).toBe(false);
  });

  it('drops a row with no date to read', () => {
    expect(matchesQuickDate(experience({ startDate: undefined }), 'today', NOW)).toBe(false);
  });
});

describe('matchesTimeOfDay', () => {
  it('keeps everything when nothing is picked', () => {
    expect(matchesTimeOfDay(experience(), [])).toBe(true);
  });

  it('sorts a start time into its band', () => {
    expect(matchesTimeOfDay(experience({ startDate: '2026-10-05T06:00:00' }), ['morning'])).toBe(
      true,
    );
    expect(matchesTimeOfDay(experience({ startDate: '2026-10-05T14:00:00' }), ['afternoon'])).toBe(
      true,
    );
    expect(matchesTimeOfDay(experience({ startDate: '2026-10-05T19:00:00' }), ['evening'])).toBe(
      true,
    );
  });

  it('keeps anything matching one of several picked bands', () => {
    expect(
      matchesTimeOfDay(experience({ startDate: '2026-10-05T19:00:00' }), ['morning', 'evening']),
    ).toBe(true);
  });

  it('drops a band that was not picked', () => {
    expect(matchesTimeOfDay(experience({ startDate: '2026-10-05T06:00:00' }), ['evening'])).toBe(
      false,
    );
  });

  it('drops a row with no date to read', () => {
    expect(matchesTimeOfDay(experience({ startDate: undefined }), ['morning'])).toBe(false);
  });
});
