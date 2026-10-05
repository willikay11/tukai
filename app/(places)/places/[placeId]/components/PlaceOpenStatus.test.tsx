import React from 'react';

import { render, screen } from '@testing-library/react';

import { PlaceOpenStatus } from './PlaceOpenStatus';

const usePlaceReservationProfiles = jest.fn();
const usePlaceAvailability = jest.fn();

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceReservationProfiles: () => usePlaceReservationProfiles(),
  usePlaceAvailability: (placeId: string, profileId?: string) =>
    usePlaceAvailability(placeId, profileId),
}));

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const profile = (status: string) => ({
  id: 'p1',
  status,
  reservationType: 'restaurant_reservation',
});

const rule = (dayOfWeek: number, openTime: string, closeTime: string) => ({
  id: `r-${dayOfWeek}`,
  reservationProfile: 'p1',
  dayOfWeek,
  openTime,
  closeTime,
  slotIntervalMinutes: 60,
});

// Mon-Sun 10:00-22:00 so the assertions do not depend on which weekday the
// frozen clock lands on
const EVERY_DAY = [0, 1, 2, 3, 4, 5, 6].map((day) => rule(day, '10:00', '22:00'));

describe('PlaceOpenStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePlaceReservationProfiles.mockReturnValue({
      data: { data: { results: [profile('active')] } },
    });
    usePlaceAvailability.mockReturnValue({ data: { data: { rules: EVERY_DAY, exceptions: [] } } });
  });

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 24, 12, 0));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('says it is open, and when it shuts', () => {
    render(<PlaceOpenStatus placeId="place-1" />);

    expect(screen.getByTestId('place-open-status')).toHaveTextContent('Open now · Closes 10 PM');
    expect(screen.getByTestId('Sun03Icon')).toBeInTheDocument();
  });

  it('says when it opens again once shut', () => {
    jest.setSystemTime(new Date(2026, 7, 24, 8, 0));
    render(<PlaceOpenStatus placeId="place-1" />);

    expect(screen.getByTestId('place-open-status')).toHaveTextContent('Closed · Opens 10 AM');
    expect(screen.getByTestId('Moon02Icon')).toBeInTheDocument();

    jest.setSystemTime(new Date(2026, 7, 24, 12, 0));
  });

  // Most places are not bookable, so most places have no hours - and a place
  // with no hours must not be labelled either way
  it('renders nothing when the place has no reservation profile', () => {
    usePlaceReservationProfiles.mockReturnValue({ data: { data: { results: [] } } });
    usePlaceAvailability.mockReturnValue({ data: undefined });

    render(<PlaceOpenStatus placeId="place-1" />);

    expect(screen.queryByTestId('place-open-status')).not.toBeInTheDocument();
  });

  it('renders nothing while the hours are still loading', () => {
    usePlaceAvailability.mockReturnValue({ data: undefined });

    render(<PlaceOpenStatus placeId="place-1" />);

    expect(screen.queryByTestId('place-open-status')).not.toBeInTheDocument();
  });

  // Settings a venue has not published are not opening hours
  it('ignores a draft or paused profile', () => {
    usePlaceReservationProfiles.mockReturnValue({
      data: { data: { results: [profile('draft'), profile('paused')] } },
    });

    render(<PlaceOpenStatus placeId="place-1" />);

    expect(usePlaceAvailability).toHaveBeenCalledWith('place-1', undefined);
  });

  it('asks for the hours of the active profile only', () => {
    render(<PlaceOpenStatus placeId="place-1" />);

    expect(usePlaceAvailability).toHaveBeenCalledWith('place-1', 'p1');
  });
});
