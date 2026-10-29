import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PlaceOwnerPanel } from './PlaceOwnerPanel';

const openCreateExperience = jest.fn();
jest.mock('@/context/CreateExperienceDrawerContext', () => ({
  useCreateExperienceDrawer: () => ({ openCreateExperience }),
}));

const openPlace = jest.fn();
jest.mock('@/context/PlaceDrawerContext', () => ({
  usePlaceDrawer: () => ({ openPlace }),
}));

describe('PlaceOwnerPanel', () => {
  beforeEach(() => {
    openCreateExperience.mockClear();
    openPlace.mockClear();
  });

  it('points Edit place at its Dashboard form', () => {
    render(<PlaceOwnerPanel placeId="p1" placeName="Kraftory" />);

    expect(screen.getByText('You manage this place')).toBeInTheDocument();
    expect(screen.getByText('Kraftory')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Edit place/ })).toHaveAttribute(
      'href',
      '/dashboard/places/p1/edit',
    );
  });

  it('opens the Create experience drawer from New experience', () => {
    render(<PlaceOwnerPanel placeId="p1" placeName="Kraftory" />);

    fireEvent.click(screen.getByRole('button', { name: /New experience/ }));

    expect(openCreateExperience).toHaveBeenCalledTimes(1);
  });

  it('opens the place drawer on its reservation settings, not a Dashboard page', () => {
    render(<PlaceOwnerPanel placeId="p1" placeName="Kraftory" />);

    expect(screen.queryByRole('link', { name: /Reservation settings/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reservation settings/ }));

    expect(openPlace).toHaveBeenCalledWith('p1', { view: 'reservations' });
  });
});
