import { ReadonlyURLSearchParams } from 'next/navigation';

import { EMPTY_FILTERS, ResultType, SearchFilters } from '@/types/search';

export type { ResultType, SearchFilters };
export { EMPTY_FILTERS };

export const EXPERIENCE_TYPES: Array<{ value: string; label: string }> = [
  { value: 'standard', label: 'One day' },
  { value: 'itinerary', label: 'Itinerary' },
  { value: 'restaurant_reservation', label: 'Restaurant' },
  { value: 'cinema_reservation', label: 'Cinema' },
  { value: 'guide_booking', label: 'Guided' },
];

export const RESULT_TYPES: Array<{ value: ResultType; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'places', label: 'Places' },
  { value: 'communities', label: 'Communities' },
];

/** Read the filters out of the URL, which is where they live. */
export const filtersFromParams = (
  params: ReadonlyURLSearchParams | URLSearchParams,
): SearchFilters => ({
  query: params.get('q') ?? '',
  type: (RESULT_TYPES.find((one) => one.value === params.get('type'))?.value ??
    'all') as ResultType,
  category: params.get('category') ?? undefined,
  date: params.get('date') ?? undefined,
  freeOnly: params.get('free') === '1',
  availableOnly: params.get('available') === '1',
  experienceType: params.get('xtype') ?? undefined,
  popularFirst: params.get('sort') === 'popular',
});

/** And back again, leaving out whatever is at its default. */
export const paramsFromFilters = (filters: SearchFilters): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.query.trim()) params.set('q', filters.query.trim());
  if (filters.type !== 'all') params.set('type', filters.type);
  if (filters.category) params.set('category', filters.category);
  if (filters.date) params.set('date', filters.date);
  if (filters.freeOnly) params.set('free', '1');
  if (filters.availableOnly) params.set('available', '1');
  if (filters.experienceType) params.set('xtype', filters.experienceType);
  if (filters.popularFirst) params.set('sort', 'popular');

  return params;
};

export type FilterChip = {
  /** The filter this chip stands for, so removing it knows what to clear. */
  key: keyof SearchFilters;
  label: string;
};

/**
 * One chip per narrowing in force. The query is not a chip — it is the search
 * itself, and a reader who cleared it from here would be left on a results
 * page with nothing to show.
 */
export const activeChips = (filters: SearchFilters, categoryName?: string): FilterChip[] => {
  const chips: FilterChip[] = [];

  if (filters.type !== 'all') {
    chips.push({
      key: 'type',
      label: RESULT_TYPES.find((one) => one.value === filters.type)?.label ?? filters.type,
    });
  }

  if (filters.category) {
    chips.push({ key: 'category', label: categoryName ?? 'Category' });
  }

  if (filters.date) chips.push({ key: 'date', label: filters.date });
  if (filters.freeOnly) chips.push({ key: 'freeOnly', label: 'Free' });
  if (filters.availableOnly) chips.push({ key: 'availableOnly', label: 'Has spots' });

  if (filters.experienceType) {
    chips.push({
      key: 'experienceType',
      label:
        EXPERIENCE_TYPES.find((one) => one.value === filters.experienceType)?.label ??
        filters.experienceType,
    });
  }

  if (filters.popularFirst) chips.push({ key: 'popularFirst', label: 'Most popular' });

  return chips;
};

/** Clearing one chip, without disturbing the rest. */
export const withoutFilter = (filters: SearchFilters, key: keyof SearchFilters): SearchFilters => {
  switch (key) {
    case 'type':
      return { ...filters, type: 'all' };
    case 'freeOnly':
      return { ...filters, freeOnly: false };
    case 'availableOnly':
      return { ...filters, availableOnly: false };
    case 'popularFirst':
      return { ...filters, popularFirst: false };
    default:
      return { ...filters, [key]: undefined };
  }
};

/** Everything off, but still searching for the same thing. */
export const clearedFilters = (filters: SearchFilters): SearchFilters => ({
  ...EMPTY_FILTERS,
  query: filters.query,
});

export const countActive = (filters: SearchFilters): number => activeChips(filters).length;

/** Whether to show results at all, rather than the rails. */
export const hasSearch = (filters: SearchFilters): boolean =>
  Boolean(filters.query.trim()) || countActive(filters) > 0;
