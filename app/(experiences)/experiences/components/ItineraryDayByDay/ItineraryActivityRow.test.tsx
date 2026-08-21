import React from 'react';

import { render, screen } from '@testing-library/react';

import { ItineraryDayActivity } from '@/types/itinerary';

import { ItineraryActivityRow } from './ItineraryActivityRow';

jest.mock('next/image', () => {
  function MockImage({ alt, src }: Record<string, unknown>) {
    return <img alt={alt as string} src={src as string} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});

const activity = (overrides: Partial<ItineraryDayActivity> = {}): ItineraryDayActivity =>
  ({
    id: 'a1',
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
    ...overrides,
  }) as ItineraryDayActivity;

describe('ItineraryActivityRow', () => {
  it('renders the place photo, title and formatted date + time', () => {
    render(<ItineraryActivityRow activity={activity()} dayDate="2026-08-24" />);

    expect(screen.getByAltText('Sanctuary Farm')).toHaveAttribute(
      'src',
      'https://cdn.tukai.co/a.webp',
    );
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByText(/24\/08\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/6:00 AM - 10:00 AM/)).toBeInTheDocument();
  });

  // The photo column stays reserved so every activity's text lines up
  it('keeps the photo column when the activity has no photo', () => {
    const { container } = render(
      <ItineraryActivityRow activity={activity({ place: null })} dayDate="2026-08-24" />,
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('.w-12')).toBeInTheDocument();
  });

  it('shows the link arrow only when the activity has a place', () => {
    const { rerender } = render(
      <ItineraryActivityRow activity={activity()} dayDate="2026-08-24" />,
    );
    expect(screen.getByTestId('ArrowUpRight01Icon')).toBeInTheDocument();

    rerender(<ItineraryActivityRow activity={activity({ place: null })} dayDate="2026-08-24" />);
    expect(screen.queryByTestId('ArrowUpRight01Icon')).not.toBeInTheDocument();
  });

  it('shows just the start time when there is no end time', () => {
    render(<ItineraryActivityRow activity={activity({ endTime: null })} dayDate="2026-08-24" />);

    expect(screen.getByText(/6:00 AM/)).toBeInTheDocument();
    expect(screen.queryByText(/-/)).not.toBeInTheDocument();
  });

  it('omits the meta line entirely with no date and no times', () => {
    render(
      <ItineraryActivityRow
        activity={activity({ startTime: null, endTime: null })}
        dayDate={null}
      />,
    );

    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.queryByText(/\d{2}\/\d{2}\/\d{4}/)).not.toBeInTheDocument();
  });
});
