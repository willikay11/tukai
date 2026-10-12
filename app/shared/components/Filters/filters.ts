import { ReadonlyURLSearchParams } from 'next/navigation';

import {
  DistanceBand,
  DurationBand,
  EMPTY_FILTERS,
  ResultType,
  SearchFilters,
  TimeOfDay,
} from '@/types/search';

import { DURATION_BANDS } from './duration';
import { EXPERIENCE_SHAPES } from './shapes';
import { QUICK_DATES, TIME_OF_DAY } from './when';
import { DISTANCE_BANDS } from './where';

export type { ResultType, SearchFilters };
export { EMPTY_FILTERS };

export const RESULT_TYPES: Array<{ value: ResultType; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'experiences', label: 'Experiences' },
  { value: 'places', label: 'Places' },
  { value: 'communities', label: 'Communities' },
];

const numberParam = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/** Read the filters out of the URL, which is where they live. */
export const filtersFromParams = (
  params: ReadonlyURLSearchParams | URLSearchParams,
): SearchFilters => ({
  query: params.get('q') ?? '',
  type: (RESULT_TYPES.find((one) => one.value === params.get('type'))?.value ??
    'all') as ResultType,
  date: params.get('date') ?? undefined,
  quickDate: QUICK_DATES.find((one) => one.value === params.get('quick'))?.value,
  timeOfDay: (params.get('tod') ?? '')
    .split(',')
    .filter((one): one is TimeOfDay => TIME_OF_DAY.some((band) => band.value === one)),
  city: params.get('city') ?? undefined,
  interests: (params.get('interests') ?? '').split(',').filter(Boolean),
  distance: DISTANCE_BANDS.find((one) => one.value === params.get('distance'))?.value as
    | DistanceBand
    | undefined,
  freeOnly: params.get('free') === '1',
  paidOnly: params.get('paid') === '1',
  priceMin: numberParam(params.get('priceMin')),
  priceMax: numberParam(params.get('priceMax')),
  availableOnly: params.get('available') === '1',
  happeningNow: params.get('now') === '1',
  guidedToursOnly: params.get('guided') === '1',
  yourCommunitiesOnly: params.get('mine') === '1',
  experienceShapes: (params.get('xtype') ?? '').split(',').filter(Boolean),
  durationBand: DURATION_BANDS.find((one) => one.value === params.get('duration'))?.value as
    | DurationBand
    | undefined,
  popularFirst: params.get('sort') === 'popular',
});

/** And back again, leaving out whatever is at its default. */
export const paramsFromFilters = (filters: SearchFilters): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.query.trim()) params.set('q', filters.query.trim());
  if (filters.type !== 'all') params.set('type', filters.type);
  if (filters.date) params.set('date', filters.date);
  if (filters.quickDate) params.set('quick', filters.quickDate);
  if (filters.timeOfDay.length) params.set('tod', filters.timeOfDay.join(','));
  if (filters.city) params.set('city', filters.city);
  if (filters.interests.length) params.set('interests', filters.interests.join(','));
  if (filters.distance) params.set('distance', filters.distance);
  if (filters.freeOnly) params.set('free', '1');
  if (filters.paidOnly) params.set('paid', '1');
  if (filters.priceMin !== undefined) params.set('priceMin', String(filters.priceMin));
  if (filters.priceMax !== undefined) params.set('priceMax', String(filters.priceMax));
  if (filters.availableOnly) params.set('available', '1');
  if (filters.happeningNow) params.set('now', '1');
  if (filters.guidedToursOnly) params.set('guided', '1');
  if (filters.yourCommunitiesOnly) params.set('mine', '1');
  if (filters.experienceShapes.length) params.set('xtype', filters.experienceShapes.join(','));
  if (filters.durationBand) params.set('duration', filters.durationBand);
  if (filters.popularFirst) params.set('sort', 'popular');

  return params;
};

export type FilterChip = {
  /** The filter this chip stands for, so removing it knows what to clear. */
  key: keyof SearchFilters;
  label: string;
  /** For a filter holding several values, which one this chip is. */
  value?: string;
};

/**
 * One chip per narrowing in force. The query is not a chip - it is the search
 * itself, and a reader who cleared it from here would be left on a results
 * page with nothing to show.
 *
 * `categoryNames` covers both City and Interests: both read from the same
 * place-category id space, so one id-to-name map serves them both.
 */
export const activeChips = (
  filters: SearchFilters,
  categoryNames: Record<string, string> = {},
): FilterChip[] => {
  const chips: FilterChip[] = [];

  if (filters.type !== 'all') {
    chips.push({
      key: 'type',
      label: RESULT_TYPES.find((one) => one.value === filters.type)?.label ?? filters.type,
    });
  }

  if (filters.date) chips.push({ key: 'date', label: filters.date });
  if (filters.quickDate) {
    chips.push({
      key: 'quickDate',
      label: QUICK_DATES.find((one) => one.value === filters.quickDate)?.label ?? filters.quickDate,
    });
  }

  filters.timeOfDay.forEach((band) => {
    chips.push({
      key: 'timeOfDay',
      label: TIME_OF_DAY.find((one) => one.value === band)?.label ?? band,
      value: band,
    });
  });

  if (filters.city) {
    chips.push({ key: 'city', label: categoryNames[filters.city] ?? 'City' });
  }

  filters.interests.forEach((id) => {
    chips.push({ key: 'interests', label: categoryNames[id] ?? 'Interest', value: id });
  });

  if (filters.distance) {
    chips.push({
      key: 'distance',
      label:
        DISTANCE_BANDS.find((one) => one.value === filters.distance)?.label ?? filters.distance,
    });
  }

  if (filters.freeOnly) chips.push({ key: 'freeOnly', label: 'Free' });
  if (filters.paidOnly) chips.push({ key: 'paidOnly', label: 'Paid' });

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    const from = filters.priceMin ?? 0;
    const to = filters.priceMax;
    chips.push({
      key: 'priceMin',
      label: to === undefined ? `From KES ${from}` : `KES ${from}–${to}`,
    });
  }

  if (filters.availableOnly) chips.push({ key: 'availableOnly', label: 'Has spots' });
  if (filters.happeningNow) chips.push({ key: 'happeningNow', label: 'Happening now' });
  if (filters.guidedToursOnly) chips.push({ key: 'guidedToursOnly', label: 'Guided tours' });
  if (filters.yourCommunitiesOnly) {
    chips.push({ key: 'yourCommunitiesOnly', label: 'Your communities' });
  }

  filters.experienceShapes.forEach((shape) => {
    chips.push({
      key: 'experienceShapes',
      label: EXPERIENCE_SHAPES.find((one) => one.value === shape)?.label ?? shape,
      value: shape,
    });
  });

  if (filters.durationBand) {
    chips.push({
      key: 'durationBand',
      label:
        DURATION_BANDS.find((one) => one.value === filters.durationBand)?.label ??
        filters.durationBand,
    });
  }

  if (filters.popularFirst) chips.push({ key: 'popularFirst', label: 'Most popular' });

  return chips;
};

/** Clearing one chip, without disturbing the rest. */
export const withoutFilter = (
  filters: SearchFilters,
  key: keyof SearchFilters,
  value?: string,
): SearchFilters => {
  switch (key) {
    case 'experienceShapes':
      return {
        ...filters,
        // One chip per shape, so removing one leaves the others
        experienceShapes: value ? filters.experienceShapes.filter((shape) => shape !== value) : [],
      };
    case 'timeOfDay':
      return {
        ...filters,
        // One chip per band, so removing one leaves the others
        timeOfDay: value ? filters.timeOfDay.filter((band) => band !== value) : [],
      };
    case 'interests':
      return {
        ...filters,
        // One chip per interest, so removing one leaves the others
        interests: value ? filters.interests.filter((id) => id !== value) : [],
      };
    case 'priceMin':
    case 'priceMax':
      // One chip for the whole range - there is nothing to keep of a range
      // missing either end
      return { ...filters, priceMin: undefined, priceMax: undefined };
    case 'type':
      return { ...filters, type: 'all' };
    case 'freeOnly':
      return { ...filters, freeOnly: false };
    case 'paidOnly':
      return { ...filters, paidOnly: false };
    case 'availableOnly':
      return { ...filters, availableOnly: false };
    case 'happeningNow':
      return { ...filters, happeningNow: false };
    case 'guidedToursOnly':
      return { ...filters, guidedToursOnly: false };
    case 'yourCommunitiesOnly':
      return { ...filters, yourCommunitiesOnly: false };
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
