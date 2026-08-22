import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Search } from './Search';

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Radix renders its content in a portal behind an open flag; swapping it for
// plain markup keeps these tests about the popover's CONTENT
jest.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/app/shared/components/Images', () => ({
  // Deliberately does NOT echo `alt`: it is the result title, and repeating it
  // would make every title match twice
  PhotoImage: () => <span data-testid="thumbnail" />,
}));

jest.mock('@/context/SelectedCategoryContext', () => ({
  useSelectedCategory: () => ({ setSelectedCitySearchId: jest.fn() }),
}));
jest.mock('@/context/LocationContext', () => ({
  useLocation: () => ({ lat: undefined, lng: undefined }),
}));

const mockRecent = jest.fn(() => ['Hiking', 'Nyama choma']);
const addRecentSearch = jest.fn();
jest.mock('@/app/shared/hooks/useRecentSearches', () => ({
  useRecentSearches: () => ({
    recentSearches: mockRecent(),
    addRecentSearch,
    clearRecentSearches: jest.fn(),
  }),
}));

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceCategories: () => ({
    data: {
      data: {
        results: [
          { id: 'c1', name: 'Nairobi', group: 'cities' },
          { id: 'c2', name: 'Diani', group: 'cities' },
        ],
      },
    },
  }),
}));

const mockSearch = jest.fn();
jest.mock('@/app/shared/hooks/useSearch', () => ({
  useSearch: (query?: string) => mockSearch(query),
}));

const results = {
  experiences: [
    {
      id: 'e1',
      title: 'Karura Forest Hike',
      photos: [],
      priceStartsFrom: { amount: 1500, currency: 'Ksh.' },
      location: { city: 'Nairobi' },
      startDate: '2026-09-01T09:00:00Z',
      endDate: '2026-09-01T12:00:00Z',
    },
  ],
  places: [
    {
      id: 'p1',
      title: 'Karura Falls',
      photos: [],
      averageRating: 4.5,
      categories: [{ id: 'k', name: 'Parks', group: 'interests' }],
      location: { city: 'Nairobi' },
    },
  ],
  communities: [{ id: 'cm1', title: 'Karura Runners', photos: [], categories: [] }],
  counts: { experience: 2, place: 1, community: 2, total: 5 },
};

describe('Search popover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRecent.mockReturnValue(['Hiking', 'Nyama choma']);
    mockSearch.mockReturnValue({ data: undefined, isFetching: false });
  });

  describe('State A — nothing typed', () => {
    it('offers recent searches and trending destinations', () => {
      render(<Search />);

      expect(screen.getByText('Recent searches')).toBeInTheDocument();
      expect(screen.getByText('Hiking')).toBeInTheDocument();
      expect(screen.getByText('Trending destinations')).toBeInTheDocument();
      expect(screen.getByText('Nairobi')).toBeInTheDocument();
      expect(screen.getByText('Diani')).toBeInTheDocument();
    });

    // 14px, not the shared field's 14.5px. The leading has to survive the merge
    // alongside it or the placeholder reel drifts off the text baseline.
    it('sets the field text to 14px over an 18px line box', () => {
      render(<Search />);

      const field = screen.getByRole('textbox', { name: 'Search places or activities' });
      expect(field).toHaveClass('text-[14px]', 'leading-[18px]');
      expect(field).not.toHaveClass('text-[14.5px]');
    });

    it('hides the recent block when there is nothing to show', () => {
      mockRecent.mockReturnValue([]);

      render(<Search />);

      expect(screen.queryByText('Recent searches')).not.toBeInTheDocument();
      expect(screen.getByText('Trending destinations')).toBeInTheDocument();
    });

    it('runs the search when a recent chip is picked', async () => {
      const user = userEvent.setup();
      mockSearch.mockReturnValue({ data: results, isFetching: false });

      render(<Search />);
      await user.click(screen.getByText('Hiking'));

      expect(mockSearch).toHaveBeenLastCalledWith('Hiking');
      expect(addRecentSearch).toHaveBeenCalledWith('Hiking');
    });

    it('opens the city listing when a trending destination is picked', async () => {
      const user = userEvent.setup();

      render(<Search />);
      await user.click(screen.getByText('Nairobi'));

      expect(push).toHaveBeenCalledWith('/places?city=c1');
    });
  });

  describe('State B — results returned', () => {
    const typeQuery = async () => {
      const user = userEvent.setup();
      render(<Search />);
      await user.type(
        screen.getByRole('textbox', { name: 'Search places or activities' }),
        'karura',
      );
      return user;
    };

    beforeEach(() => mockSearch.mockReturnValue({ data: results, isFetching: false }));

    it('heads the panel with the total and the query', async () => {
      await typeQuery();

      await waitFor(() => expect(screen.getByText(/5 results for/)).toBeInTheDocument());
    });

    // Counts are the API's totals, not the page length — only one experience is
    // returned but two match
    it('labels each type tab with its own count', async () => {
      await typeQuery();

      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Experiences/ })).toBeInTheDocument(),
      );
      const tabFor = (label: string) => screen.getByRole('button', { name: new RegExp(label) });
      expect(tabFor('All')).toHaveTextContent(/All\s*·\s*5/);
      expect(tabFor('Experiences')).toHaveTextContent(/Experiences\s*·\s*2/);
      expect(tabFor('Places')).toHaveTextContent(/Places\s*·\s*1/);
      expect(tabFor('Communities')).toHaveTextContent(/Communities\s*·\s*2/);
    });

    it('groups the results by type', async () => {
      await typeQuery();

      await waitFor(() => expect(screen.getByText('Karura Forest Hike')).toBeInTheDocument());
      expect(screen.getByText('Karura Falls')).toBeInTheDocument();
      expect(screen.getByText('Karura Runners')).toBeInTheDocument();
    });

    it('narrows to one group when a type tab is picked', async () => {
      const user = await typeQuery();

      await waitFor(() => expect(screen.getByText('Karura Falls')).toBeInTheDocument());
      await user.click(screen.getByRole('button', { name: /Experiences/ }));

      expect(screen.getByText('Karura Forest Hike')).toBeInTheDocument();
      expect(screen.queryByText('Karura Falls')).not.toBeInTheDocument();
      expect(screen.queryByText('Karura Runners')).not.toBeInTheDocument();
    });

    it('keeps the counts unchanged while filtered', async () => {
      const user = await typeQuery();

      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Experiences/ })).toBeInTheDocument(),
      );
      await user.click(screen.getByRole('button', { name: /Experiences/ }));

      expect(screen.getByRole('button', { name: /All/ })).toHaveTextContent(/All\s*·\s*5/);
      expect(screen.getByRole('button', { name: /Places/ })).toHaveTextContent(/Places\s*·\s*1/);
    });

    it('routes to the result and remembers the query', async () => {
      const user = await typeQuery();

      await waitFor(() => expect(screen.getByText('Karura Forest Hike')).toBeInTheDocument());
      await user.click(screen.getByText('Karura Forest Hike'));

      expect(push).toHaveBeenCalledWith('/experiences/e1');
      expect(addRecentSearch).toHaveBeenCalledWith('karura');
    });

    it('says so when nothing matches', async () => {
      mockSearch.mockReturnValue({
        data: {
          experiences: [],
          places: [],
          communities: [],
          counts: { experience: 0, place: 0, community: 0, total: 0 },
        },
        isFetching: false,
      });

      await typeQuery();

      await waitFor(() => expect(screen.getByText(/No results for/)).toBeInTheDocument());
    });
  });
});
