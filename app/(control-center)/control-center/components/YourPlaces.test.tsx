import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { YourPlaces } from './YourPlaces';

const useMyPlaces = jest.fn();
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  useMyPlaces: () => useMyPlaces(),
}));

const openConnectPlace = jest.fn();
jest.mock('@/context/ConnectPlaceDrawerContext', () => ({
  useConnectPlaceDrawer: () => ({ openConnectPlace }),
}));

const place = (extra: Record<string, unknown> = {}) => ({
  id: 'p1',
  // Real places carry one, and the detail URL prefers it over the uuid
  slug: 'kraftory-biergarten',
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
    openConnectPlace.mockClear();
    withPlaces([]);
  });

  it('lists the places this host owns', () => {
    withPlaces([place()]);

    render(<YourPlaces />);

    expect(screen.getByText('Kraftory Biergarten')).toBeInTheDocument();
    expect(screen.getByText('Beer Garden · Karen')).toBeInTheDocument();
  });

  // The owner panel on the place page is where managing happens, so the card
  // goes straight there rather than to a separate console
  it('opens the place as everyone sees it', () => {
    withPlaces([place()]);

    render(<YourPlaces />);

    expect(screen.getByRole('link', { name: /Kraftory Biergarten/ })).toHaveAttribute(
      'href',
      '/places/kraftory-biergarten',
    );
  });

  // Older places predate slugs; the uuid still resolves
  it('falls back to the id where a place has no slug', () => {
    withPlaces([place({ slug: undefined })]);

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

  // Claiming is the only route to owning a place, so both entry points open it
  it('opens the connect-a-place drawer to add one', async () => {
    const user = userEvent.setup();
    render(<YourPlaces />);

    const buttons = screen.getAllByRole('button', { name: /Add a place/ });
    for (const button of buttons) {
      // eslint-disable-next-line no-await-in-loop
      await user.click(button);
    }

    expect(openConnectPlace).toHaveBeenCalledTimes(buttons.length);
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
