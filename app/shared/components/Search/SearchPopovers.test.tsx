import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Search } from './Search';

/**
 * The city popover for real, not mocked away (see Search.test.tsx for the
 * rest of the bar, which flattens Radix and CityPicker to focus on its own
 * markup instead).
 */
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/context/SelectedCategoryContext', () => ({
  useSelectedCategory: () => ({ setSelectedCitySearchId: jest.fn() }),
}));

jest.mock('@/context/LocationContext', () => ({
  useLocation: () => ({
    lat: undefined,
    lng: undefined,
    status: 'idle',
    city: 'Nairobi',
    area: undefined,
    isUsingLocation: false,
    setUsingLocation: jest.fn(),
    setCity: jest.fn(),
    requestLocation: jest.fn(),
  }),
}));

// CityPicker is real in this suite (see the comment above) and fetches its
// own city list with this
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceCategories: () => ({
    data: { data: { results: [{ id: 'c1', name: 'Mombasa', group: 'cities' }] } },
    isLoading: false,
  }),
}));

jest.mock('@/app/shared/hooks/useSearch', () => ({
  // The Filters dialog's own live preview count - not under test here
  useSearchResults: () => ({ data: undefined, isFetching: false }),
}));

jest.mock('@/app/shared/hooks/useCommunities', () => ({
  // The Filters dialog's "Your communities" toggle - not under test here
  useGetCommunities: () => ({ data: { data: { results: [] } } }),
}));

// Radix needs these before it will open anything in jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.releasePointerCapture = jest.fn();
});

describe('the city popover', () => {
  it('opens the city panel from the city button', async () => {
    render(<Search />);

    expect(screen.queryByText('Use my location')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Choose a location' }));

    expect(await screen.findByText('Use my location')).toBeInTheDocument();
  });
});
