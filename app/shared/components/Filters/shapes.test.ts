import { Experience } from '@/types/experience';

import { EXPERIENCE_SHAPES, apiExperienceType, matchesShapes, shapeOf } from './shapes';

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Sunrise hike',
    startDate: '2026-10-05T06:00:00Z',
    endDate: '2026-10-05T10:00:00Z',
    ...overrides,
  }) as unknown as Experience;

describe('EXPERIENCE_SHAPES', () => {
  it('offers the canvas four, in its order and its words', () => {
    expect(EXPERIENCE_SHAPES.map((shape) => shape.label)).toEqual([
      'One day',
      'Recurring',
      'Multi-day',
      'Itinerary',
    ]);
  });
});

/**
 * ⚠️ Only `itinerary` is a value the API filters on. The other three describe
 * how an experience sits in the calendar, which is read off the record.
 */
describe('shapeOf', () => {
  it('is one day when it starts and ends on the same date', () => {
    expect(shapeOf(experience())).toBe('one');
  });

  it('is multi-day when the dates differ', () => {
    expect(shapeOf(experience({ endDate: '2026-10-07T10:00:00Z' }))).toBe('multi');
  });

  // A recurrence rule is what makes it recurring, whatever its dates say
  it('is recurring whenever there is a rule', () => {
    expect(shapeOf(experience({ recurrenceRule: 'FREQ=WEEKLY' }))).toBe('recurring');
    expect(
      shapeOf(experience({ recurrenceRule: 'FREQ=WEEKLY', endDate: '2026-10-09T10:00:00Z' })),
    ).toBe('recurring');
  });

  // The one shape the API itself names takes precedence over the dates
  it('is an itinerary when the API says so', () => {
    expect(
      shapeOf(experience({ experienceType: 'itinerary', recurrenceRule: 'FREQ=WEEKLY' })),
    ).toBe('itinerary');
  });

  it('falls back to one day without dates to read', () => {
    expect(shapeOf(experience({ startDate: undefined, endDate: undefined }))).toBe('one');
  });
});

describe('matchesShapes', () => {
  it('keeps everything when nothing is picked', () => {
    expect(matchesShapes(experience(), [])).toBe(true);
  });

  it('keeps what was picked and drops the rest', () => {
    expect(matchesShapes(experience(), ['one'])).toBe(true);
    expect(matchesShapes(experience(), ['multi'])).toBe(false);
  });

  it('keeps anything matching one of several picks', () => {
    expect(matchesShapes(experience(), ['multi', 'one'])).toBe(true);
  });
});

describe('apiExperienceType', () => {
  // Narrowing the query only works when the single pick is the one the API knows
  it('narrows the query for an itinerary-only pick', () => {
    expect(apiExperienceType(['itinerary'])).toBe('itinerary');
  });

  it('leaves the query alone for anything else', () => {
    expect(apiExperienceType(['one'])).toBeUndefined();
    expect(apiExperienceType(['itinerary', 'one'])).toBeUndefined();
    expect(apiExperienceType([])).toBeUndefined();
  });
});
