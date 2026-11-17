import { Experience } from '@/types/experience';

import { upcomingItineraries } from './useUpcomingItineraries';

jest.mock('@/app/shared/hooks/useExperiences', () => ({ useExperiences: jest.fn() }));
jest.mock('@/context/LocationContext', () => ({ useLocation: jest.fn() }));

const itinerary = (id: string, startDate: string, endDate: string) =>
  ({ id, startDate, endDate }) as Experience;

const now = new Date('2026-11-04T12:00:00Z');

describe('upcomingItineraries', () => {
  it('keeps what is still to come, soonest first', () => {
    const result = upcomingItineraries(
      [
        itinerary('later', '2026-12-01T09:00:00Z', '2026-12-01T18:00:00Z'),
        itinerary('past', '2026-10-01T09:00:00Z', '2026-10-01T18:00:00Z'),
        itinerary('soon', '2026-11-10T09:00:00Z', '2026-11-10T18:00:00Z'),
      ],
      now,
    );

    expect(result.map((item) => item.id)).toEqual(['soon', 'later']);
  });

  it('keeps one already under way', () => {
    const result = upcomingItineraries(
      [itinerary('on', '2026-11-03T09:00:00Z', '2026-11-06T18:00:00Z')],
      now,
    );

    expect(result.map((item) => item.id)).toEqual(['on']);
  });
});
