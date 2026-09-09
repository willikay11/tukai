import React from 'react';

import { render, screen } from '@testing-library/react';

import { PlaceOwnerPanel } from './PlaceOwnerPanel';

describe('PlaceOwnerPanel', () => {
  it('points each owner job at where it is done', () => {
    render(<PlaceOwnerPanel placeId="p1" placeName="Kraftory" />);

    expect(screen.getByText('You manage this place')).toBeInTheDocument();
    expect(screen.getByText('Kraftory')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /Edit place/ })).toHaveAttribute(
      'href',
      '/creator-studio/places/p1/edit',
    );
    expect(screen.getByRole('link', { name: /Reservation settings/ })).toHaveAttribute(
      'href',
      '/creator-studio/places/p1?tab=reservations',
    );
    expect(screen.getByRole('link', { name: /New experience/ })).toHaveAttribute(
      'href',
      '/experiences/create',
    );
  });
});
