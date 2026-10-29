import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ClaimPlaceSummary } from '@/types/claim';

import { SetupReservations } from './SetupReservations';

const usePlaceReservationProfiles = jest.fn();
const openPlace = jest.fn();
let drawer: { openPlace: typeof openPlace } | null = null;

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceReservationProfiles: (...args: unknown[]) => usePlaceReservationProfiles(...args),
}));
jest.mock('@/context/PlaceDrawerContext', () => ({
  usePlaceDrawer: () => drawer,
}));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const place: ClaimPlaceSummary = { id: 'place-1', title: 'Karura Forest', isOnTukai: true };

const withProfiles = (results: unknown[]) =>
  usePlaceReservationProfiles.mockReturnValue({ data: { data: { results } } });

describe('SetupReservations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    drawer = { openPlace };
    withProfiles([]);
  });

  describe.each(['row', 'footer'] as const)('as the %s action', (variant) => {
    it('offers to set up reservations for a place that has no settings', () => {
      render(<SetupReservations place={place} variant={variant} onNavigate={jest.fn()} />);

      expect(screen.getByRole('button', { name: /Set up reservations/ })).toBeInTheDocument();
    });

    it('offers the settings once the place has a reservation profile', () => {
      withProfiles([{ id: 'prof-1' }]);

      render(<SetupReservations place={place} variant={variant} onNavigate={jest.fn()} />);

      expect(screen.getByRole('button', { name: /Reservation settings/ })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Set up reservations/ })).not.toBeInTheDocument();
    });

    it('asks the profiles of the place it was given', () => {
      render(<SetupReservations place={place} variant={variant} onNavigate={jest.fn()} />);

      expect(usePlaceReservationProfiles).toHaveBeenCalledWith('place-1');
    });

    it('opens the place drawer on its settings, after getting out of the way', () => {
      const onNavigate = jest.fn();
      render(<SetupReservations place={place} variant={variant} onNavigate={onNavigate} />);

      fireEvent.click(screen.getByRole('button', { name: /Set up reservations/ }));

      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(openPlace).toHaveBeenCalledWith('place-1', { view: 'reservations' });
    });

    it('falls back to the settings page where there is no place drawer', () => {
      drawer = null;
      const onNavigate = jest.fn();
      render(<SetupReservations place={place} variant={variant} onNavigate={onNavigate} />);

      const link = screen.getByRole('link', { name: /Set up reservations/ });
      fireEvent.click(link);

      expect(link).toHaveAttribute('href', '/control-center/places/place-1/reservations');
      expect(onNavigate).toHaveBeenCalledTimes(1);
      expect(openPlace).not.toHaveBeenCalled();
    });
  });
});
