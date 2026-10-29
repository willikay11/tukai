import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PlaceOwnerPanel } from './PlaceOwnerPanel';

const openCreateExperience = jest.fn();
jest.mock('@/context/CreateExperienceDrawerContext', () => ({
  useCreateExperienceDrawer: () => ({ openCreateExperience }),
}));

describe('PlaceOwnerPanel', () => {
  beforeEach(() => {
    openCreateExperience.mockClear();
  });

  it('points each owner job at where it is done', () => {
    render(<PlaceOwnerPanel placeId="p1" placeName="Kraftory" />);

    expect(screen.getByText('You manage this place')).toBeInTheDocument();
    expect(screen.getByText('Kraftory')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Edit place/ })).toHaveAttribute(
      'href',
      '/dashboard/places/p1/edit',
    );
    expect(screen.getByRole('link', { name: /Reservation settings/ })).toHaveAttribute(
      'href',
      '/dashboard/places/p1/reservations',
    );
  });

  it('opens the Create experience drawer from New experience', () => {
    render(<PlaceOwnerPanel placeId="p1" placeName="Kraftory" />);

    fireEvent.click(screen.getByRole('button', { name: /New experience/ }));

    expect(openCreateExperience).toHaveBeenCalledTimes(1);
  });
});
