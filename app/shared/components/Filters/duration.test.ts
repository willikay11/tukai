import { Experience } from '@/types/experience';

import { DURATION_BANDS, durationMinutesOf, matchesDuration } from './duration';

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Sunrise hike',
    startDate: '2026-10-05T06:00:00',
    endDate: '2026-10-05T08:00:00',
    ...overrides,
  }) as unknown as Experience;

describe('DURATION_BANDS', () => {
  it('offers the canvas three, in its order and its words', () => {
    expect(DURATION_BANDS.map((band) => band.label)).toEqual([
      'Up to 2 hours',
      '2 to 5 hours',
      'Full day',
    ]);
  });
});

describe('durationMinutesOf', () => {
  it('reads the minutes between start and end', () => {
    expect(durationMinutesOf(experience())).toBe(120);
  });

  // A recurring experience's dates describe the whole series, not one run
  it('is null for a recurring experience', () => {
    expect(durationMinutesOf(experience({ recurrenceRule: 'FREQ=WEEKLY' }))).toBeNull();
  });

  it('is null without dates to read', () => {
    expect(durationMinutesOf(experience({ startDate: undefined }))).toBeNull();
  });
});

describe('matchesDuration', () => {
  it('keeps everything when no band is picked', () => {
    expect(matchesDuration(experience(), undefined)).toBe(true);
  });

  it('sorts a run into its band', () => {
    expect(matchesDuration(experience({ endDate: '2026-10-05T07:30:00' }), 'short')).toBe(true);
    expect(matchesDuration(experience({ endDate: '2026-10-05T10:00:00' }), 'medium')).toBe(true);
    expect(matchesDuration(experience({ endDate: '2026-10-06T06:00:00' }), 'full')).toBe(true);
  });

  it('drops a run outside the band', () => {
    expect(matchesDuration(experience({ endDate: '2026-10-05T10:00:00' }), 'short')).toBe(false);
  });

  it('drops a recurring row, which has no single run to measure', () => {
    expect(matchesDuration(experience({ recurrenceRule: 'FREQ=WEEKLY' }), 'short')).toBe(false);
  });
});
