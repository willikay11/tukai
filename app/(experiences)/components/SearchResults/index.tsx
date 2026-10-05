'use client';

import { useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  CommunityResultRow,
  ExperienceResultRow,
  PlaceResultRow,
  ResultGroup,
} from '@/app/shared/components/Search';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useSearchResults } from '@/app/shared/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { PlaceCategory } from '@/types/placeCategory';
import { communityPath, experiencePath, placePath } from '@/utils/detail-paths';

import { FiltersDialog } from './FiltersDialog';
import { ResultsFilterBar } from './ResultsFilterBar';
import {
  FilterChip,
  SearchFilters,
  activeChips,
  clearedFilters,
  paramsFromFilters,
  withoutFilter,
} from './filters';
import { matchesShapes } from './shapes';

const RowSkeleton = () => (
  <div className="flex items-center gap-3 py-2">
    <div className="h-14 w-14 flex-shrink-0 animate-pulse rounded-xl bg-gray-100" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
    </div>
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
  const drawer = usePlaceDrawer();
  const searchParams = useSearchParams();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: results, isFetching } = useSearchResults(filters);
  const { data: categoriesResponse } = usePlaceCategories(
    { pageSize: 100 },
    Boolean(filters.category),
  );

  const categoryName = useMemo(() => {
    const categories: PlaceCategory[] = categoriesResponse?.data?.results ?? [];
    return categories.find((one) => one.id === filters.category)?.name;
  }, [categoriesResponse, filters.category]);

  // The filters are the URL, so changing them is a navigation
  const apply = (next: SearchFilters) => {
    const params = paramsFromFilters(next);
    // Anything the page carries that is not a filter stays put
    const tab = searchParams.get('tab');
    if (tab) params.set('tab', tab);

    router.replace(params.toString() ? `/?${params.toString()}` : '/', { scroll: false });
    setIsEditOpen(false);
  };

  const chips = activeChips(filters, categoryName);
  // The API cannot filter by day-shape, so those picks narrow the rows here -
  // and the counts below are taken from the same rows, so the two agree
  const experiences = (results?.experiences ?? []).filter((experience) =>
    matchesShapes(experience, filters.experienceShapes),
  );
  const places = results?.places ?? [];
  const communities = results?.communities ?? [];
  const narrowedByShape = filters.experienceShapes.length > 0;
  const experienceCount = narrowedByShape ? experiences.length : (results?.counts.experience ?? 0);
  const total = narrowedByShape
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

      <ResultsFilterBar
        chips={chips}
        onEdit={() => setIsEditOpen(true)}
        onRemove={(chip: FilterChip) => apply(withoutFilter(filters, chip.key, chip.value))}
        onClearAll={() => apply(clearedFilters(filters))}
        sortLabel={filters.popularFirst ? 'Most popular' : 'Most relevant'}
        onToggleSort={() => apply({ ...filters, popularFirst: !filters.popularFirst })}
      />

      {isFetching && total === 0 ? (
        <div className="mt-4 space-y-2">
          {[0, 1, 2, 3].map((row) => (
            <RowSkeleton key={row} />
          ))}
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
              {experiences.map((experience) => (
                <ExperienceResultRow
                  key={experience.id}
                  item={experience}
                  onClick={() => router.push(experiencePath(experience))}
                />
              ))}
            </ResultGroup>
          )}

          {places.length > 0 && (
            <ResultGroup
              title="Places"
              count={`${results?.counts.place} ${results?.counts.place === 1 ? 'place' : 'places'}`}
            >
              {places.map((place) => (
                <PlaceResultRow
                  key={place.id}
                  item={place}
                  onClick={() =>
                    drawer ? drawer.openPlace(place.id) : router.push(placePath(place))
                  }
                />
              ))}
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

      <FiltersDialog
        filters={filters}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onApply={apply}
      />
    </div>
  );
};
