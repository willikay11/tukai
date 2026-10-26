'use client';

import { useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { ExperienceCard } from '@/app/(experiences)/components/ExperienceCard';
import { PlaceCard } from '@/app/(experiences)/components/PlaceCard';
import { FiltersDialog } from '@/app/shared/components/Filters';
import { matchesYourCommunities } from '@/app/shared/components/Filters/community';
import { matchesDuration } from '@/app/shared/components/Filters/duration';
import {
  FilterChip,
  SearchFilters,
  activeChips,
  clearedFilters,
  paramsFromFilters,
  withoutFilter,
} from '@/app/shared/components/Filters/filters';
import { matchesPrice } from '@/app/shared/components/Filters/price';
import { matchesShapes } from '@/app/shared/components/Filters/shapes';
import {
  effectiveSort,
  sortExperiences,
  sortOfferedOn,
  sortPlaces,
} from '@/app/shared/components/Filters/sort';
import { matchesQuickDate, matchesTimeOfDay } from '@/app/shared/components/Filters/when';
import {
  NAIROBI_CENTER,
  distanceKm as distanceBetween,
  matchesDistance,
  matchesInterests,
} from '@/app/shared/components/Filters/where';
import { IconComponent } from '@/app/shared/components/Icons';
import { isOngoing } from '@/app/shared/components/Places/PlaceDrawer/happening-now';
import { CommunityResultRow, ResultGroup } from '@/app/shared/components/Search';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useSearchResults } from '@/app/shared/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { useLocation } from '@/context/LocationContext';
import { PlaceCategory } from '@/types/placeCategory';
import { communityPath } from '@/utils/detail-paths';

import { ResultsFilterBar } from './ResultsFilterBar';

// The same grid cell size DiscoverGrid and ListPlaces use, so a card here
// sits exactly as it would on the main pages rather than as a row
const CARD_GRID =
  'grid grid-cols-[repeat(auto-fill,184px)] justify-start gap-x-4 gap-y-[26px] 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-7';

const CardGridSkeleton = ({ count }: { count: number }) => (
  <div className={CARD_GRID}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="aspect-square animate-pulse rounded-xl bg-gray-100" />
    ))}
  </div>
);

/**
 * What a search found.
 *
 * The canvas replaces the rails with this the moment a query or a filter is
 * live, so the filters live in the URL: a result list is a place you can send
 * someone, and the back button has to mean something.
 */
export const SearchResults = ({ filters }: { filters: SearchFilters }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: results, isFetching } = useSearchResults(filters);
  const needsCategoryNames = Boolean(filters.city) || filters.interests.length > 0;
  const { data: categoriesResponse } = usePlaceCategories({ pageSize: 100 }, needsCategoryNames);
  const { lat, lng } = useLocation();
  // Capped at the hook's own page size (12) - "Your communities" is a
  // best-effort proxy already (followed, not joined; see `matchesYourCommunities`),
  // so a reader following more than that sees it narrow imperfectly rather
  // than not at all
  const { data: followedResponse } = useGetCommunities({
    page: 1,
    enabled: filters.yourCommunitiesOnly,
    following: true,
  });

  const categoryNames = useMemo(() => {
    const categories: PlaceCategory[] = categoriesResponse?.data?.results ?? [];
    return Object.fromEntries(categories.map((one) => [one.id, one.name]));
  }, [categoriesResponse]);

  const followedCommunityIds = useMemo(
    () => (followedResponse?.data?.results ?? []).map((one: { id: string }) => one.id),
    [followedResponse],
  );

  const origin = lat !== undefined && lng !== undefined ? { lat, lng } : NAIROBI_CENTER;

  // The filters are the URL, so changing them is a navigation
  const apply = (next: SearchFilters) => {
    const params = paramsFromFilters(next);
    // Anything the page carries that is not a filter stays put
    const tab = searchParams.get('tab');
    if (tab) params.set('tab', tab);

    router.replace(params.toString() ? `/?${params.toString()}` : '/', { scroll: false });
    setIsEditOpen(false);
  };

  const chips = activeChips(filters, categoryNames);
  // Everything the API itself cannot narrow by is read off the rows instead -
  // and the counts below are taken from the same rows, so the two always agree
  const filteredExperiences = (results?.experiences ?? []).filter(
    (experience) =>
      matchesShapes(experience, filters.experienceShapes) &&
      matchesQuickDate(experience, filters.quickDate) &&
      matchesTimeOfDay(experience, filters.timeOfDay) &&
      matchesInterests(experience, filters.interests) &&
      matchesDistance(experience, filters.distance, origin) &&
      matchesPrice(experience, filters) &&
      matchesDuration(experience, filters.durationBand) &&
      matchesYourCommunities(experience, filters.yourCommunitiesOnly, followedCommunityIds) &&
      (!filters.happeningNow || isOngoing(experience)),
  );
  const filteredPlaces = (results?.places ?? []).filter((place) =>
    matchesDistance(place, filters.distance, origin),
  );
  const communities = results?.communities ?? [];

  // "Looking for" decides which options the menu offers; a pick the current
  // tab doesn't offer stays in the URL but acts as Recommended meanwhile
  const sort = effectiveSort(filters.sort, filters.type);
  const sortOptions = sortOfferedOn(filters.type);
  const experiences = sortExperiences(filteredExperiences, sort, origin);
  const places = sortPlaces(filteredPlaces, sort, origin);

  // The card-line distance shown on both kinds - Nearest first, or any
  // distance filter, measured from the same origin the sort itself uses.
  // Anything without a known location gets no line rather than a wrong one.
  const showsDistance = sort === 'near' || Boolean(filters.distance);
  const distanceTo = (row: { location?: { pointLat?: number; pointLong?: number } }) => {
    const lat = row.location?.pointLat;
    const lng = row.location?.pointLong;
    return lat !== undefined && lng !== undefined
      ? distanceBetween(origin, { lat, lng })
      : undefined;
  };
  const narrowedClientSide =
    filters.experienceShapes.length > 0 ||
    Boolean(filters.quickDate) ||
    filters.timeOfDay.length > 0 ||
    filters.interests.length > 0 ||
    Boolean(filters.distance) ||
    filters.paidOnly ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    Boolean(filters.durationBand) ||
    filters.happeningNow ||
    filters.yourCommunitiesOnly;
  const experienceCount = narrowedClientSide
    ? experiences.length
    : (results?.counts.experience ?? 0);
  const placeCount = Boolean(filters.distance) ? places.length : (results?.counts.place ?? 0);
  const total = narrowedClientSide
    ? experiences.length + places.length + communities.length
    : (results?.counts.total ?? 0);

  const heading = filters.query.trim()
    ? `Results for “${filters.query.trim()}”`
    : 'Filtered results';

  return (
    <div>
      <h1 className="text-[22px] font-bold tracking-tight text-brand-ink">{heading}</h1>
      <p className="mt-1.5 text-13 text-ink-muted">
        {isFetching
          ? 'Looking…'
          : `${total} ${total === 1 ? 'result' : 'results'}${
              filters.type === 'all' ? '' : ` in ${filters.type}`
            }`}
      </p>

      <FiltersDialog
        filters={filters}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onApply={apply}
      >
        {/* A plain wrapper, not the bar itself - the bar is a bare function
            component, which cannot take the ref the anchor needs */}
        <div>
          <ResultsFilterBar
            chips={chips}
            searchTerm={filters.query.trim() || undefined}
            onEdit={() => setIsEditOpen(true)}
            onRemove={(chip: FilterChip) => apply(withoutFilter(filters, chip.key, chip.value))}
            onRemoveSearch={() => apply({ ...filters, query: '' })}
            onClearAll={() => apply(clearedFilters(filters))}
            sort={sort}
            sortOptions={sortOptions}
            onSortChange={(next) => apply({ ...filters, sort: next })}
          />
        </div>
      </FiltersDialog>

      {isFetching && total === 0 ? (
        <div className="mt-6">
          <CardGridSkeleton count={8} />
        </div>
      ) : total === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl bg-surface py-16 text-center">
          <IconComponent
            iconName="Search01Icon"
            size={28}
            color="currentColor"
            className="text-ink-subtle"
          />
          <p className="text-sm text-ink">Nothing matched.</p>
          <p className="max-w-sm text-13 text-ink-muted">
            {chips.length > 0
              ? 'Loosen one of the filters above and results come back.'
              : 'Check the spelling, or try a broader word.'}
          </p>
          {chips.length > 0 && (
            <Button
              variant="canvas-outline"
              onClick={() => apply(clearedFilters(filters))}
              className="mt-1 rounded-full px-5"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {experiences.length > 0 && (
            <ResultGroup
              title="Experiences"
              count={`${experienceCount} ${experienceCount === 1 ? 'experience' : 'experiences'}`}
            >
              <div className={CARD_GRID}>
                {experiences.map((experience) => (
                  // w-full so the card fills its column, same as DiscoverGrid
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    className="w-full"
                    resultDistanceKm={showsDistance ? distanceTo(experience) : undefined}
                  />
                ))}
              </div>
            </ResultGroup>
          )}

          {places.length > 0 && (
            <ResultGroup
              title="Places"
              count={`${placeCount} ${placeCount === 1 ? 'place' : 'places'}`}
            >
              <div className={CARD_GRID}>
                {places.map((place) => (
                  // w-full so the card fills its column, same as ListPlaces
                  <PlaceCard
                    key={place.id}
                    place={place}
                    className="w-full"
                    resultDistanceKm={showsDistance ? distanceTo(place) : undefined}
                    showRating={sort === 'rating'}
                  />
                ))}
              </div>
            </ResultGroup>
          )}

          {communities.length > 0 && (
            <ResultGroup
              title="Communities"
              count={`${results?.counts.community} ${
                results?.counts.community === 1 ? 'community' : 'communities'
              }`}
            >
              {communities.map((community) => (
                <CommunityResultRow
                  key={community.id}
                  item={community}
                  onClick={() => router.push(communityPath(community))}
                />
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </div>
  );
};
