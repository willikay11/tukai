import React from 'react';

import { render, screen } from '@testing-library/react';

import { ItineraryDay, activityPhoto, itineraryDayDate } from '@/types/itinerary';

import { ItineraryDayByDay } from './index';

let response: unknown;
let isLoading = false;

jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useFetchItineraryDays: () => ({ data: response, isLoading }),
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: Record<string, unknown>) {
    return <img alt={alt as string} src={src as string} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

// Mirrors /v1/experiences/{id}/itinerary-days/ after parseSnakeToCamel
const day = (dayNumber: number, overrides: Partial<ItineraryDay> = {}): ItineraryDay =>
  ({
    id: `d${dayNumber}`,
    dayNumber,
    title: 'Day Trip: Medieval San Gimignano',
    description: '<p>Piazzale Michelangelo offers a stunning view &amp; more.</p>',
    activities: [
      {
        id: `a${dayNumber}`,
        title: 'Breakfast',
        description: '',
        startTime: '06:00:00',
        endTime: '10:00:00',
        order: 0,
        location: null,
        place: {
          id: 'p1',
          title: 'Sanctuary Farm',
          photos: [{ id: 'ph1', photo: 'https://cdn.tukai.co/a.webp', isCover: true }],
        },
      },
    ],
    ...overrides,
  }) as ItineraryDay;

const setDays = (days: ItineraryDay[]) => {
  response = { data: { count: days.length, results: days } };
};

beforeEach(() => {
  isLoading = false;
  setDays([day(1)]);
});

describe('ItineraryDayByDay', () => {
  it('renders the section heading and a dated day label', () => {
    render(<ItineraryDayByDay experienceId="e1" startDate="2026-08-24T06:00:00Z" />);

    expect(screen.getByText('Day by day')).toBeInTheDocument();
    expect(screen.getByText('Day 1: Mon 24 August')).toBeInTheDocument();
  });

  // Day N is the experience start plus N-1; the API stores no per-day date
  it('advances the date by one day per day number', () => {
    setDays([day(1), day(2, { id: 'd2' })]);
    render(<ItineraryDayByDay experienceId="e1" startDate="2026-08-24T06:00:00Z" />);

    expect(screen.getByText('Day 1: Mon 24 August')).toBeInTheDocument();
    expect(screen.getByText('Day 2: Tue 25 August')).toBeInTheDocument();
  });

  it('falls back to a bare day label with no experience start date', () => {
    render(<ItineraryDayByDay experienceId="e1" startDate={null} />);

    expect(screen.getByText('Day 1')).toBeInTheDocument();
  });

  // Descriptions are stored as HTML
  it('strips markup and decodes entities in the day description', () => {
    render(<ItineraryDayByDay experienceId="e1" startDate="2026-08-24T06:00:00Z" />);

    expect(screen.getByText('Piazzale Michelangelo offers a stunning view & more.')).toBeInTheDocument();
    expect(screen.queryByText(/<p>|&amp;/)).not.toBeInTheDocument();
  });

  it('renders the activity with its date and time range', () => {
    render(<ItineraryDayByDay experienceId="e1" startDate="2026-08-24T06:00:00Z" />);

    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText(/24\/08\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/6:00 AM - 10:00 AM/)).toBeInTheDocument();
  });

  it('orders days and activities by their numbers', () => {
    setDays([day(2, { id: 'd2' }), day(1)]);
    render(<ItineraryDayByDay experienceId="e1" startDate="2026-08-24T06:00:00Z" />);

    const headings = screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent);
    expect(headings).toEqual(['Day 1: Mon 24 August', 'Day 2: Tue 25 August']);
  });

  it('renders nothing for an experience with no itinerary days', () => {
    setDays([]);
    const { container } = render(<ItineraryDayByDay experienceId="e1" startDate={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows a skeleton while loading', () => {
    isLoading = true;
    const { container } = render(<ItineraryDayByDay experienceId="e1" startDate={null} />);

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

describe('itinerary helpers', () => {
  it('offsets the day date from the experience start', () => {
    expect(itineraryDayDate('2026-08-24T06:00:00Z', 3)?.getDate()).toBe(26);
  });

  it('returns null for a missing or unparseable start', () => {
    expect(itineraryDayDate(null, 1)).toBeNull();
    expect(itineraryDayDate('not-a-date', 1)).toBeNull();
  });

  it('prefers the place cover photo, then the first', () => {
    expect(
      activityPhoto({
        place: {
          id: 'p',
          title: 't',
          photos: [
            { id: '1', photo: 'first.jpg' },
            { id: '2', photo: 'cover.jpg', isCover: true },
          ],
        },
      } as never),
    ).toBe('cover.jpg');
  });

  it('returns null when the activity has no place or photos', () => {
    expect(activityPhoto({ place: null } as never)).toBeNull();
    expect(activityPhoto({ place: { id: 'p', title: 't', photos: [] } } as never)).toBeNull();
  });
});
