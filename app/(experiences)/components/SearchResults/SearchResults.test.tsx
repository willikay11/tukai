import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EMPTY_FILTERS, SearchFilters } from '@/types/search';

import { SearchResults } from './index';

const replace = jest.fn();
const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push }),
  useSearchParams: () => new URLSearchParams(),
}));

let results: {
  experiences: unknown[];
  places: unknown[];
  communities: unknown[];
  counts: { experience: number; place: number; community: number; total: number };
};
let isFetching = false;

jest.mock('@/app/shared/hooks/useSearch', () => ({
  useSearchResults: () => ({ data: results, isFetching }),
}));

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceCategories: () => ({ data: { data: { results: [{ id: 'c1', name: 'Hiking' }] } } }),
}));

// The experience row measures distance from the reader
jest.mock('@/context/LocationContext', () => ({
  useLocation: () => ({ lat: undefined, lng: undefined }),
}));

jest.mock('./EditFiltersDrawer', () => ({
  EditFiltersDrawer: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div>filters open</div> : null),
}));

const filters = (overrides: Partial<SearchFilters> = {}): SearchFilters => ({
  ...EMPTY_FILTERS,
  ...overrides,
});

const someResults = {
  experiences: [{ id: 'e1', title: 'Sunrise hike', slug: 'sunrise-hike', photos: [] }],
  places: [{ id: 'p1', title: 'Karura Forest', slug: 'karura', photos: [], location: {} }],
  communities: [],
  counts: { experience: 1, place: 1, community: 0, total: 2 },
};

const empty = {
  experiences: [],
  places: [],
  communities: [],
  counts: { experience: 0, place: 0, community: 0, total: 0 },
};

describe('the results view', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    results = someResults;
    isFetching = false;
  });

  it('heads the page with what was searched for', () => {
    render(<SearchResults filters={filters({ query: 'hike' })} />);

    expect(screen.getByRole('heading', { name: 'Results for “hike”' })).toBeInTheDocument();
    expect(screen.getByText('2 results')).toBeInTheDocument();
  });

  // A filter with no words is still a search
  it('heads a filter-only search differently', () => {
    render(<SearchResults filters={filters({ freeOnly: true })} />);

    expect(screen.getByRole('heading', { name: 'Filtered results' })).toBeInTheDocument();
  });

  it('groups the results by type, with the API totals', () => {
    render(<SearchResults filters={filters({ query: 'hike' })} />);

    expect(screen.getByText('Experiences')).toBeInTheDocument();
    expect(screen.getByText('1 experience')).toBeInTheDocument();
    expect(screen.getByText('Places')).toBeInTheDocument();
  });

  it('leaves out a group with nothing in it', () => {
    render(<SearchResults filters={filters({ query: 'hike' })} />);

    expect(screen.queryByText('Communities')).not.toBeInTheDocument();
  });

  it('shows a chip per narrowing, and none for the query', () => {
    render(<SearchResults filters={filters({ query: 'hike', type: 'places', freeOnly: true })} />);

    expect(screen.getByRole('button', { name: 'Remove Places' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Free' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove hike' })).not.toBeInTheDocument();
  });

  it('counts the narrowings on the edit button', () => {
    render(<SearchResults filters={filters({ type: 'places', freeOnly: true })} />);

    expect(screen.getByRole('button', { name: /Edit filters/ })).toHaveTextContent('2');
  });

  /** The filters are the URL, so changing one is a navigation. */
  it('removes a narrowing by rewriting the URL', async () => {
    render(<SearchResults filters={filters({ query: 'hike', freeOnly: true })} />);

    await userEvent.click(screen.getByRole('button', { name: 'Remove Free' }));

    expect(replace).toHaveBeenCalledWith('/?q=hike', expect.anything());
  });

  it('keeps the query when everything is cleared', async () => {
    render(<SearchResults filters={filters({ query: 'hike', freeOnly: true, type: 'places' })} />);

    await userEvent.click(screen.getByRole('button', { name: 'Clear all' }));

    expect(replace).toHaveBeenCalledWith('/?q=hike', expect.anything());
  });

  it('offers no Clear all when nothing is narrowed', () => {
    render(<SearchResults filters={filters({ query: 'hike' })} />);

    expect(screen.queryByRole('button', { name: 'Clear all' })).not.toBeInTheDocument();
  });

  it('toggles the ordering', async () => {
    render(<SearchResults filters={filters({ query: 'hike' })} />);

    await userEvent.click(screen.getByRole('button', { name: /Most relevant/ }));

    expect(replace).toHaveBeenCalledWith('/?q=hike&sort=popular', expect.anything());
  });

  it('opens the filter drawer', async () => {
    render(<SearchResults filters={filters({ query: 'hike' })} />);

    await userEvent.click(screen.getByRole('button', { name: /Edit filters/ }));

    expect(screen.getByText('filters open')).toBeInTheDocument();
  });

  it('names the category rather than its id', () => {
    render(<SearchResults filters={filters({ category: 'c1' })} />);

    expect(screen.getByRole('button', { name: 'Remove Hiking' })).toBeInTheDocument();
  });

  describe('when nothing matched', () => {
    beforeEach(() => {
      results = empty;
    });

    it('blames the filters when there are some', () => {
      render(<SearchResults filters={filters({ query: 'zzz', freeOnly: true })} />);

      expect(
        screen.getByText('Loosen one of the filters above and results come back.'),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
    });

    it('blames the spelling when there are none', () => {
      render(<SearchResults filters={filters({ query: 'zzz' })} />);

      expect(screen.getByText('Check the spelling, or try a broader word.')).toBeInTheDocument();
    });
  });

  it('says it is looking rather than saying nothing matched', () => {
    results = empty;
    isFetching = true;
    render(<SearchResults filters={filters({ query: 'hike' })} />);

    expect(screen.getByText('Looking…')).toBeInTheDocument();
    expect(screen.queryByText('Nothing matched.')).not.toBeInTheDocument();
  });
});
