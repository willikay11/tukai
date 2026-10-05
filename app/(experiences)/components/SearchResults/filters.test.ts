import {
  EMPTY_FILTERS,
  SearchFilters,
  activeChips,
  clearedFilters,
  countActive,
  filtersFromParams,
  hasSearch,
  paramsFromFilters,
  withoutFilter,
} from './filters';

const filters = (overrides: Partial<SearchFilters> = {}): SearchFilters => ({
  ...EMPTY_FILTERS,
  ...overrides,
});

/** The URL is where the filters live, so the two directions have to agree. */
describe('reading filters out of the URL', () => {
  it('reads a bare query', () => {
    expect(filtersFromParams(new URLSearchParams('q=karura'))).toMatchObject({
      query: 'karura',
      type: 'all',
    });
  });

  it('reads every narrowing', () => {
    const read = filtersFromParams(
      new URLSearchParams(
        'q=hike&type=experiences&category=c1&date=2026-10-05&free=1&available=1&xtype=itinerary&sort=popular',
      ),
    );

    expect(read).toEqual({
      query: 'hike',
      type: 'experiences',
      category: 'c1',
      date: '2026-10-05',
      freeOnly: true,
      availableOnly: true,
      experienceShapes: ['itinerary'],
      popularFirst: true,
    });
  });

  // A type nobody offers is not a type
  it('falls back to all on a type it does not know', () => {
    expect(filtersFromParams(new URLSearchParams('type=unicorns')).type).toBe('all');
  });

  it('reads nothing as nothing', () => {
    expect(filtersFromParams(new URLSearchParams(''))).toEqual(EMPTY_FILTERS);
  });
});

describe('writing filters back', () => {
  it('leaves out whatever sits at its default', () => {
    expect(paramsFromFilters(filters({ query: 'hike' })).toString()).toBe('q=hike');
  });

  it('writes each narrowing that is on', () => {
    const written = paramsFromFilters(
      filters({ query: 'hike', type: 'places', category: 'c1', popularFirst: true }),
    );

    expect(written.get('type')).toBe('places');
    expect(written.get('category')).toBe('c1');
    expect(written.get('sort')).toBe('popular');
  });

  it('survives a round trip', () => {
    const original = filters({
      query: 'karura',
      type: 'experiences',
      date: '2026-10-05',
      freeOnly: true,
    });

    expect(filtersFromParams(paramsFromFilters(original))).toEqual(original);
  });

  it('trims the query rather than searching for spaces', () => {
    expect(paramsFromFilters(filters({ query: '  hike  ' })).get('q')).toBe('hike');
  });
});

describe('activeChips', () => {
  /**
   * The query is the search itself, not a narrowing. A chip for it would let
   * someone clear it and be left on a results page with nothing to show.
   */
  it('does not make a chip of the query', () => {
    expect(activeChips(filters({ query: 'hike' }))).toEqual([]);
  });

  it('makes one chip per narrowing', () => {
    const chips = activeChips(filters({ type: 'places', freeOnly: true, availableOnly: true }));

    expect(chips.map((chip) => chip.label)).toEqual(['Places', 'Free', 'Has spots']);
  });

  it('names a category rather than showing its id', () => {
    expect(activeChips(filters({ category: 'c1' }), 'Hiking')[0].label).toBe('Hiking');
  });

  it('falls back where the category name has not loaded', () => {
    expect(activeChips(filters({ category: 'c1' }))[0].label).toBe('Category');
  });

  // One chip per shape, since a reader can pick several
  it('names each experience shape in words', () => {
    const chips = activeChips(filters({ experienceShapes: ['one', 'itinerary'] }));

    expect(chips.map((chip) => chip.label)).toEqual(['One day', 'Itinerary']);
  });
});

describe('removing one narrowing', () => {
  it.each([
    ['type', { type: 'places' as const }],
    ['freeOnly', { freeOnly: true }],
    ['availableOnly', { availableOnly: true }],
    ['popularFirst', { popularFirst: true }],
    ['category', { category: 'c1' }],
    ['date', { date: '2026-10-05' }],
  ] as Array<[keyof SearchFilters, Partial<SearchFilters>]>)('clears %s', (key, on) => {
    expect(countActive(withoutFilter(filters(on), key))).toBe(0);
  });

  it('clears one shape and leaves the others', () => {
    const next = withoutFilter(
      filters({ experienceShapes: ['one', 'itinerary'] }),
      'experienceShapes',
      'one',
    );

    expect(next.experienceShapes).toEqual(['itinerary']);
  });

  it('leaves the others alone', () => {
    const next = withoutFilter(filters({ freeOnly: true, availableOnly: true }), 'freeOnly');

    expect(next.availableOnly).toBe(true);
    expect(next.freeOnly).toBe(false);
  });

  it('keeps the query when a narrowing goes', () => {
    expect(withoutFilter(filters({ query: 'hike', freeOnly: true }), 'freeOnly').query).toBe(
      'hike',
    );
  });
});

describe('clearing everything', () => {
  // Clear all clears the filters, not the search
  it('keeps the query and drops the rest', () => {
    const cleared = clearedFilters(
      filters({ query: 'hike', type: 'places', freeOnly: true, category: 'c1' }),
    );

    expect(cleared).toEqual({ ...EMPTY_FILTERS, query: 'hike' });
  });
});

describe('hasSearch', () => {
  it('is true for a query', () => {
    expect(hasSearch(filters({ query: 'hike' }))).toBe(true);
  });

  // A filter with no words is still a search: the canvas shows results for it
  it('is true for a filter on its own', () => {
    expect(hasSearch(filters({ freeOnly: true }))).toBe(true);
  });

  it('is false for nothing, and for whitespace', () => {
    expect(hasSearch(EMPTY_FILTERS)).toBe(false);
    expect(hasSearch(filters({ query: '   ' }))).toBe(false);
  });
});
