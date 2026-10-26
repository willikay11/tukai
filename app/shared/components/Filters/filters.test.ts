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
        'q=hike&type=experiences&date=2026-10-05&quick=weekend&tod=morning,evening' +
          '&city=c1&interests=i1,i2&distance=5km&free=1&paid=0&priceMin=500&priceMax=5000' +
          '&available=1&now=1&guided=1&mine=1&xtype=itinerary&duration=short&sort=popular',
      ),
    );

    expect(read).toEqual({
      query: 'hike',
      type: 'experiences',
      date: '2026-10-05',
      quickDate: 'weekend',
      timeOfDay: ['morning', 'evening'],
      city: 'c1',
      interests: ['i1', 'i2'],
      distance: '5km',
      freeOnly: true,
      paidOnly: false,
      priceMin: 500,
      priceMax: 5000,
      availableOnly: true,
      happeningNow: true,
      guidedToursOnly: true,
      yourCommunitiesOnly: true,
      experienceShapes: ['itinerary'],
      durationBand: 'short',
      // The old places-only toggle this replaced - read as its closest
      // equivalent today, places ranked by rating
      sort: 'rating',
    });
  });

  it('reads a sort value directly', () => {
    expect(filtersFromParams(new URLSearchParams('sort=near')).sort).toBe('near');
  });

  // A sort nobody offers is not one
  it('falls back to Recommended on a sort it does not know', () => {
    expect(filtersFromParams(new URLSearchParams('sort=shuffled')).sort).toBe('rec');
  });

  // A quick pick or band nobody offers is not one
  it('drops a quick date or a time band it does not know', () => {
    const read = filtersFromParams(new URLSearchParams('quick=yesterday&tod=morning,midnight'));

    expect(read.quickDate).toBeUndefined();
    expect(read.timeOfDay).toEqual(['morning']);
  });

  // A distance band or duration band nobody offers is not one
  it('drops a distance or duration band it does not know', () => {
    const read = filtersFromParams(new URLSearchParams('distance=1000km&duration=forever'));

    expect(read.distance).toBeUndefined();
    expect(read.durationBand).toBeUndefined();
  });

  it('reads a rating band', () => {
    expect(filtersFromParams(new URLSearchParams('rating=4.5')).rating).toBe(4.5);
  });

  it('drops a rating band nobody offers', () => {
    expect(filtersFromParams(new URLSearchParams('rating=3')).rating).toBeUndefined();
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
      filters({
        query: 'hike',
        type: 'places',
        city: 'c1',
        interests: ['i1', 'i2'],
        distance: '10km',
        paidOnly: true,
        priceMin: 500,
        priceMax: 5000,
        happeningNow: true,
        guidedToursOnly: true,
        yourCommunitiesOnly: true,
        durationBand: 'full',
        rating: 4.5,
        sort: 'near',
      }),
    );

    expect(written.get('type')).toBe('places');
    expect(written.get('city')).toBe('c1');
    expect(written.get('interests')).toBe('i1,i2');
    expect(written.get('distance')).toBe('10km');
    expect(written.get('paid')).toBe('1');
    expect(written.get('priceMin')).toBe('500');
    expect(written.get('priceMax')).toBe('5000');
    expect(written.get('now')).toBe('1');
    expect(written.get('guided')).toBe('1');
    expect(written.get('mine')).toBe('1');
    expect(written.get('duration')).toBe('full');
    expect(written.get('rating')).toBe('4.5');
    expect(written.get('sort')).toBe('near');
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

  it('survives a round trip with a quick date and time bands', () => {
    const original = filters({
      query: 'karura',
      type: 'experiences',
      quickDate: 'next7',
      timeOfDay: ['afternoon', 'evening'],
    });

    expect(filtersFromParams(paramsFromFilters(original))).toEqual(original);
  });

  it('survives a round trip with the newer narrowings', () => {
    const original = filters({
      query: 'karura',
      city: 'c1',
      interests: ['i1', 'i2'],
      distance: '25km',
      priceMin: 1000,
      priceMax: 8000,
      durationBand: 'medium',
      rating: 4,
      sort: 'price',
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

  it('names a city or an interest rather than showing its id', () => {
    const names = { c1: 'Nairobi', i1: 'Hiking' };
    const chips = activeChips(filters({ city: 'c1', interests: ['i1'] }), names);

    expect(chips.map((chip) => chip.label)).toEqual(['Nairobi', 'Hiking']);
  });

  it('falls back where the name has not loaded', () => {
    expect(activeChips(filters({ city: 'c1' }))[0].label).toBe('City');
    expect(activeChips(filters({ interests: ['i1'] }))[0].label).toBe('Interest');
  });

  // One chip per interest, since a reader can pick several
  it('names each interest in its own chip', () => {
    const chips = activeChips(filters({ interests: ['i1', 'i2'] }), { i1: 'Hiking', i2: 'Food' });

    expect(chips.map((chip) => chip.label)).toEqual(['Hiking', 'Food']);
  });

  it('names a distance band', () => {
    expect(activeChips(filters({ distance: '10km' }))[0].label).toBe('Within 10 km');
  });

  it('names Paid alongside Free', () => {
    expect(activeChips(filters({ paidOnly: true }))[0].label).toBe('Paid');
  });

  it('makes one chip for a price range, not one per end', () => {
    expect(activeChips(filters({ priceMin: 500, priceMax: 5000 })).map((c) => c.label)).toEqual([
      'KES 500–5000',
    ]);
    expect(activeChips(filters({ priceMin: 500 })).map((c) => c.label)).toEqual(['From KES 500']);
  });

  it('names happening now, guided tours and your communities', () => {
    const chips = activeChips(
      filters({ happeningNow: true, guidedToursOnly: true, yourCommunitiesOnly: true }),
    );

    expect(chips.map((chip) => chip.label)).toEqual([
      'Happening now',
      'Guided tours',
      'Your communities',
    ]);
  });

  // One chip per shape, since a reader can pick several
  it('names each experience shape in words', () => {
    const chips = activeChips(filters({ experienceShapes: ['one', 'itinerary'] }));

    expect(chips.map((chip) => chip.label)).toEqual(['One day', 'Itinerary']);
  });

  it('names a quick date pick', () => {
    expect(activeChips(filters({ quickDate: 'weekend' }))[0].label).toBe('This weekend');
  });

  // One chip per band, since a reader can pick several
  it('names each time-of-day band in words', () => {
    const chips = activeChips(filters({ timeOfDay: ['morning', 'evening'] }));

    expect(chips.map((chip) => chip.label)).toEqual(['Morning', 'Evening']);
  });

  it('names a duration band', () => {
    expect(activeChips(filters({ durationBand: 'full' }))[0].label).toBe('Full day');
  });

  it('names a rating band', () => {
    expect(activeChips(filters({ rating: 4.5 }))[0].label).toBe('4.5 and up');
  });

  // The sort has its own menu, which already says what it's set to - a chip
  // for it would just repeat that, and "Clear all" must not touch it
  it('makes no chip for the sort', () => {
    expect(activeChips(filters({ sort: 'near' }))).toEqual([]);
  });
});

describe('removing one narrowing', () => {
  it.each([
    ['type', { type: 'places' as const }],
    ['freeOnly', { freeOnly: true }],
    ['paidOnly', { paidOnly: true }],
    ['availableOnly', { availableOnly: true }],
    ['happeningNow', { happeningNow: true }],
    ['guidedToursOnly', { guidedToursOnly: true }],
    ['yourCommunitiesOnly', { yourCommunitiesOnly: true }],
    ['city', { city: 'c1' }],
    ['distance', { distance: '5km' as const }],
    ['durationBand', { durationBand: 'short' as const }],
    ['rating', { rating: 4 as const }],
    ['date', { date: '2026-10-05' }],
    ['quickDate', { quickDate: 'weekend' as const }],
  ] as Array<[keyof SearchFilters, Partial<SearchFilters>]>)('clears %s', (key, on) => {
    expect(countActive(withoutFilter(filters(on), key))).toBe(0);
  });

  it('clears both ends of the price range from either end', () => {
    expect(countActive(withoutFilter(filters({ priceMin: 500, priceMax: 5000 }), 'priceMin'))).toBe(
      0,
    );
    expect(countActive(withoutFilter(filters({ priceMin: 500, priceMax: 5000 }), 'priceMax'))).toBe(
      0,
    );
  });

  it('clears one shape and leaves the others', () => {
    const next = withoutFilter(
      filters({ experienceShapes: ['one', 'itinerary'] }),
      'experienceShapes',
      'one',
    );

    expect(next.experienceShapes).toEqual(['itinerary']);
  });

  it('clears one time-of-day band and leaves the others', () => {
    const next = withoutFilter(
      filters({ timeOfDay: ['morning', 'evening'] }),
      'timeOfDay',
      'morning',
    );

    expect(next.timeOfDay).toEqual(['evening']);
  });

  it('clears one interest and leaves the others', () => {
    const next = withoutFilter(filters({ interests: ['i1', 'i2'] }), 'interests', 'i1');

    expect(next.interests).toEqual(['i2']);
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
      filters({ query: 'hike', type: 'places', freeOnly: true, city: 'c1' }),
    );

    expect(cleared).toEqual({ ...EMPTY_FILTERS, query: 'hike' });
  });

  // Sort isn't a filter - "Clear all" and removing a chip never touch it
  it('keeps the sort too', () => {
    const cleared = clearedFilters(filters({ query: 'hike', freeOnly: true, sort: 'near' }));

    expect(cleared.sort).toBe('near');
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
