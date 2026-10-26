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

// Results now render as ExperienceCard/PlaceCard, the same cards the main
// pages use - these are the mocks those cards need, same as their own tests
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
jest.mock('@/context/ExperienceDrawerContext', () => ({ useExperienceDrawer: () => null }));
jest.mock('@/context/PlaceDrawerContext', () => ({ usePlaceDrawer: () => null }));
jest.mock('@/app/shared/components/Bookmark', () => ({
  Bookmark: () => <button type="button">bookmark</button>,
}));
jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});
jest.mock('next/link', () => {
  // Forwards every prop, so class-based assertions see what the card renders
  function MockLink({ children, href, ...rest }: Record<string, unknown>) {
    return (
      <a href={href as string} {...rest}>
        {children as React.ReactNode}
      </a>
    );
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

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

jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useGetCommunities: () => ({ data: { data: { results: [] } } }),
}));

jest.mock('@/app/shared/components/Filters', () => ({
  FiltersDialog: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => (
    <>
      {children}
      {isOpen && <div>filters open</div>}
    </>
  ),
}));

// Radix's dropdown menu (SortMenu) needs these before it will open in jsdom
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
  window.HTMLElement.prototype.hasPointerCapture = jest.fn();
  window.HTMLElement.prototype.releasePointerCapture = jest.fn();
});

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

  // The main /experiences and /places pages render their cards in this same
  // grid - a flat list of rows reads as a different, lesser product here
  it('lays experiences and places out in the same card grid the main pages use', () => {
    render(<SearchResults filters={filters({ query: 'hike' })} />);

    const experienceTitle = screen.getByText('Sunrise hike');
    const experienceGrid = experienceTitle.closest('.grid');
    expect(experienceGrid).toHaveClass('grid-cols-[repeat(auto-fill,184px)]');

    const placeTitle = screen.getByText('Karura Forest');
    const placeGrid = placeTitle.closest('.grid');
    expect(placeGrid).toHaveClass('grid-cols-[repeat(auto-fill,184px)]');
  });

  it('leaves out a group with nothing in it', () => {
    render(<SearchResults filters={filters({ query: 'hike' })} />);

    expect(screen.queryByText('Communities')).not.toBeInTheDocument();
  });

  it('shows a chip per narrowing, with the query as its own pill', () => {
    render(<SearchResults filters={filters({ query: 'hike', type: 'places', freeOnly: true })} />);

    expect(screen.getByRole('button', { name: 'Remove Places' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Free' })).toBeInTheDocument();
    // The query isn't one of `activeChips`' narrowings - it gets its own pill instead
    expect(screen.queryByRole('button', { name: 'Remove hike' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove search for hike' })).toHaveTextContent(
      'Search: hike',
    );
  });

  it('hides the search pill when there is no query', () => {
    render(<SearchResults filters={filters({ freeOnly: true })} />);

    expect(screen.queryByText(/^Search:/)).not.toBeInTheDocument();
  });

  it('clears just the query when its pill is closed, keeping the rest', async () => {
    render(<SearchResults filters={filters({ query: 'hike', freeOnly: true })} />);

    await userEvent.click(screen.getByRole('button', { name: 'Remove search for hike' }));

    expect(replace).toHaveBeenCalledWith('/?free=1', expect.anything());
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

  it('changes the order from the sort menu', async () => {
    render(<SearchResults filters={filters({ query: 'hike' })} />);

    await userEvent.click(screen.getByRole('button', { name: 'Sort by' }));
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Nearest first' }));

    expect(replace).toHaveBeenCalledWith('/?q=hike&sort=near', expect.anything());
  });

  // "Looking for" is Everything by default, which offers every option
  it('offers only what the current tab supports', async () => {
    render(<SearchResults filters={filters({ query: 'hike', type: 'places' })} />);

    await userEvent.click(screen.getByRole('button', { name: 'Sort by' }));

    expect(screen.queryByRole('menuitemradio', { name: 'Lowest price' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'Top rated' })).toBeInTheDocument();
  });

  it('opens the filter drawer', async () => {
    render(<SearchResults filters={filters({ query: 'hike' })} />);

    await userEvent.click(screen.getByRole('button', { name: /Edit filters/ }));

    expect(screen.getByText('filters open')).toBeInTheDocument();
  });

  it('names the city rather than its id', () => {
    render(<SearchResults filters={filters({ city: 'c1' })} />);

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
