import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Search } from './Search';

/**
 * The popovers for real, not mocked away.
 *
 * The search bar holds a city button that opens a panel of its own. When the
 * whole bar was the results popover's *trigger*, that button sat inside
 * another trigger and a click on it opened the results panel instead — the
 * city panel never appeared. The rest of the Search suite swaps Radix for
 * plain markup, so nothing there could see it.
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

jest.mock('@/app/shared/hooks/useRecentSearches', () => ({
  useRecentSearches: () => ({
    recentSearches: [],
    addRecentSearch: jest.fn(),
    clearRecentSearches: jest.fn(),
  }),
}));

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceCategories: () => ({
    data: { data: { results: [{ id: 'c1', name: 'Mombasa', group: 'cities' }] } },
    isLoading: false,
  }),
}));

jest.mock('@/app/shared/hooks/useSearch', () => ({
  useSearch: () => ({ data: undefined, isFetching: false }),
}));

// Radix needs these before it will open anything in jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.releasePointerCapture = jest.fn();
});

describe('the bar’s two popovers', () => {
  it('opens the city panel from the city button', async () => {
    render(<Search />);

    expect(screen.queryByText('Use my location')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Choose a location' }));

    expect(await screen.findByText('Use my location')).toBeInTheDocument();
  });

  // The regression: this used to open the results panel instead
  it('does not open the results panel from the city button', async () => {
    render(<Search />);

    await userEvent.click(screen.getByRole('button', { name: 'Choose a location' }));

    expect(screen.queryByText('Trending destinations')).not.toBeInTheDocument();
  });

  it('still opens the results panel from the field', async () => {
    render(<Search />);

    await userEvent.click(screen.getByRole('textbox', { name: 'Search Tukai' }));

    expect(await screen.findByText('Trending destinations')).toBeInTheDocument();
  });
});
