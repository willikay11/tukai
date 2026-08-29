import React from 'react';

import { render, screen } from '@testing-library/react';

import { YourPlaces } from './YourPlaces';

const useMyPlaces = jest.fn();
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useMyPlaces: () => useMyPlaces(),
}));

const place = (extra: Record<string, unknown> = {}) => ({
  id: 'p1',
  title: 'Kraftory Biergarten',
  photos: [{ id: 'ph1', photo: 'https://cdn.tukai.co/a.jpg', isCover: true }],
  categories: [{ id: 'c1', name: 'Beer Garden', group: 'interests' }],
  location: { city: 'Karen' },
  averageRating: 4.5,
  totalReviews: 12,
  ...extra,
});

const withPlaces = (results: unknown[], isLoading = false) =>
  useMyPlaces.mockReturnValue({ data: { data: { results } }, isLoading });

describe('YourPlaces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    withPlaces([]);
  });

  it('lists the places this host owns', () => {
    withPlaces([place()]);

    render(<YourPlaces />);

    expect(screen.getByText('Kraftory Biergarten')).toBeInTheDocument();
    expect(screen.getByText('Beer Garden · Karen')).toBeInTheDocument();
  });

  it('opens a place from its card', () => {
    withPlaces([place()]);

    render(<YourPlaces />);

    expect(screen.getByRole('link', { name: /Kraftory Biergarten/ })).toHaveAttribute(
      'href',
      '/places/p1',
    );
  });

  it('holds its shape with skeletons while loading', () => {
    withPlaces([], true);

    render(<YourPlaces />);

    expect(screen.getAllByRole('status', { name: 'Loading your places' })).toHaveLength(3);
    // The add tile waits until the list is known, though the header action stays
    expect(screen.queryByText('Claim a place your community owns')).not.toBeInTheDocument();
  });

  // Claiming is the only route to owning a place, so both entry points lead there
  it('sends the host to the claim flow to add one', () => {
    render(<YourPlaces />);

    screen
      .getAllByRole('link', { name: /Add a place/ })
      .forEach((link) => expect(link).toHaveAttribute('href', '/places/claim'));
  });

  it('says what the empty tile is for when nothing is owned yet', () => {
    render(<YourPlaces />);

    expect(screen.getByText('Claim a place your community owns')).toBeInTheDocument();
  });

  it('offers another claim once a place is owned', () => {
    withPlaces([place()]);

    render(<YourPlaces />);

    expect(screen.getByText('Claim another place')).toBeInTheDocument();
  });
});
