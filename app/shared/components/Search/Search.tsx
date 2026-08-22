'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Search01Icon } from '@hugeicons/react-pro';
import { debounce } from 'lodash';

import { SimplePillFilters } from '@/app/shared/components/Filters';
import { IconComponent } from '@/app/shared/components/Icons';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useRecentSearches } from '@/app/shared/hooks/useRecentSearches';
import { useSearch } from '@/app/shared/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { PlaceCategory } from '@/types/placeCategory';
import { SearchResultType } from '@/types/search';

import { CommunityResultRow } from './CommunityResultRow';
import { ExperienceResultRow } from './ExperienceResultRow';
import { PlaceResultRow } from './PlaceResultRow';
import { RecentSearchPill } from './RecentSearchPill';
import { ResultGroup } from './ResultGroup';
import { RotatingPlaceholder } from './RotatingPlaceholder';
import { SearchSectionHeading } from './SearchSectionHeading';
import { SuggestionRow } from './SuggestionRow';

// Narrowing while typing stays a short list; the idle grid is four across,
// so it takes enough to fill two rows
const SUGGESTION_LIMIT = 6;
const TRENDING_LIMIT = 8;
const DEBOUNCE_MS = 300;

type TypeFilter = 'all' | SearchResultType;

export const Search = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSelectedCitySearchId } = useSelectedCategory();
  const { data: placeCategories } = usePlaceCategories({ pageSize: 100, group: 'cities' }, true);
  const [query, setQuery] = useState<string>();
  const [tag, setTag] = useState<PlaceCategory | undefined>();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  // `query` lags by the debounce, so the placeholder tracks the field directly
  const [isFieldEmpty, setIsFieldEmpty] = useState(true);
  const { data: searchResults, isFetching: isSearching } = useSearch(query, tag?.id);
  const { recentSearches, addRecentSearch } = useRecentSearches();
  const inputElRef = useRef<HTMLInputElement | null>(null);

  const hasQuery = Boolean(query?.trim());

  // One debounced setter for the component's life. Building it inline per
  // keystroke — as this did — gives every keystroke its own timer with nothing
  // to cancel, so it delays each search rather than collapsing them.
  const debouncedSetQuery = useMemo(
    () => debounce((value: string) => setQuery(value), DEBOUNCE_MS),
    [],
  );
  useEffect(() => () => debouncedSetQuery.cancel(), [debouncedSetQuery]);

  const experiences = searchResults?.experiences ?? [];
  const places = searchResults?.places ?? [];
  const communities = searchResults?.communities ?? [];
  const counts = searchResults?.counts;
  const total = counts?.total ?? 0;

  const typeTabs = [
    { label: 'All', value: 'all', count: total },
    { label: 'Experiences', value: 'experience', count: counts?.experience ?? 0 },
    { label: 'Places', value: 'place', count: counts?.place ?? 0 },
    { label: 'Communities', value: 'community', count: counts?.community ?? 0 },
  ];

  const showGroup = (type: SearchResultType) => typeFilter === 'all' || typeFilter === type;

  // Location suggestions come from the curated cities categories — there is
  // no dedicated suggestions endpoint. When typing, narrow them by name.
  const cities: PlaceCategory[] = placeCategories?.data?.results ?? [];
  const suggestions = hasQuery
    ? cities
        .filter((city) => city.name.toLowerCase().includes(query!.trim().toLowerCase()))
        .slice(0, SUGGESTION_LIMIT)
    : cities.slice(0, TRENDING_LIMIT);

  const removeTag = () => {
    setTag(undefined);
    setSelectedCitySearchId('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('city');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (searchResults) {
      setShowSearchResults(true);
    }
  }, [searchResults]);

  useEffect(() => {
    if (showSearchResults) {
      // small timeout to ensure popover has mounted / focus isn't stolen
      const t = setTimeout(() => {
        inputElRef.current?.focus();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [showSearchResults]);

  const handleSelectLocation = (category: PlaceCategory) => {
    setShowSearchResults(false);
    setSelectedCitySearchId(category.id);
    // Only /places consumes the city filter — experiences have no city param
    router.push(`/places?city=${category.id}`);
  };

  // The input is uncontrolled (it debounces into `query`), so replaying a term
  // means writing it back to the element as well as to state
  const runSearch = (term: string) => {
    if (inputElRef.current) {
      inputElRef.current.value = term;
    }
    setIsFieldEmpty(!term);
    // Skip the debounce — the term is complete, not mid-typing
    debouncedSetQuery.cancel();
    setQuery(term);
    setTypeFilter('all');
    addRecentSearch(term);
    setShowSearchResults(true);
  };

  const handleSubmitSearch = () => {
    const typed = inputElRef.current?.value ?? '';
    if (typed.trim()) {
      addRecentSearch(typed);
    }
    setShowSearchResults(true);
  };

  const BASE_PATH: Record<SearchResultType, string> = {
    experience: '/experiences',
    place: '/places',
    community: '/communities',
  };

  const go = (type: SearchResultType, id: string) => {
    setShowSearchResults(false);
    // The query led the reader here, so it is worth offering again
    if (query?.trim()) {
      addRecentSearch(query);
    }
    router.push(`${BASE_PATH[type]}/${id}`);
  };

  return (
    <Popover open={showSearchResults} onOpenChange={(isOpen) => setShowSearchResults(isOpen)}>
      <PopoverTrigger asChild className="my-4 md:my-0">
        {/* Plain box so the popover has a whole-field element to anchor to,
            rather than the <input> inside it */}
        <div className="w-full">
          <Input
            shape="pill"
            ref={inputElRef}
            // No `placeholder` attribute: it cannot be animated, so the reel is
            // drawn over the empty field and this names the input instead
            aria-label="Search places or activities"
            overlay={<RotatingPlaceholder visible={isFieldEmpty} />}
            // 14px here rather than the shared field's 14.5px. `leading` has to
            // follow the size: tailwind-merge treats a text-* utility as also
            // setting line-height, so written first it would be dropped and the
            // placeholder reel would fall out of line with the text.
            className="text-[14px] leading-[18px]"
            // Tighter than the standard 13px/16px because a full-height button
            // sits inside the pill
            containerClassName="w-full bg-white py-1 pl-4 pr-1 shadow-search-bar"
            icon={
              <>
                <Search01Icon size={18} className="flex-shrink-0 text-gray-400" variant="twotone" />
                {tag && (
                  <span
                    className="inline-flex flex-shrink-0 cursor-pointer items-center gap-1 rounded-full bg-gray-100 py-1 pl-2 pr-1 text-sm"
                    onClick={() => removeTag()}
                  >
                    {tag.name}
                    <div className="flex items-center justify-center rounded-full bg-gray-400 p-1">
                      <IconComponent iconName="Cancel01Icon" size={12} color="white" />
                    </div>
                  </span>
                )}
              </>
            }
            suffixIcon={
              <Button
                variant="gradient"
                size="sm"
                onClick={handleSubmitSearch}
                className="flex-shrink-0 rounded-full px-6"
              >
                Search
              </Button>
            }
            onClick={() => setShowSearchResults(true)}
            onFocus={() => setShowSearchResults(true)}
            onChange={(e) => {
              setIsFieldEmpty(e.target.value.length === 0);
              debouncedSetQuery(e.target.value);
            }}
          />
        </div>
      </PopoverTrigger>
      {/* Anchored to the field's right edge and grown leftwards: the field sits
          at the right of the header, so aligning left would push the panel off
          screen. `collisionPadding` keeps it clear of the viewport edge, and the
          max-width clamps it on anything narrower than the panel itself. */}
      <PopoverContent
        align="end"
        collisionPadding={16}
        className="z-50 max-h-[80vh] w-[860px] max-w-[calc(100vw-3rem)] overflow-y-auto rounded-3xl border-gray-100 p-0 shadow-xl"
      >
        {/* Idle — what the reader sees before typing anything */}
        {!hasQuery && (
          <div className="space-y-6 p-5">
            {recentSearches.length > 0 && (
              <div className="space-y-3">
                <SearchSectionHeading>Recent searches</SearchSectionHeading>
                <div className="flex flex-wrap gap-3">
                  {recentSearches.map((term) => (
                    <RecentSearchPill key={term} term={term} onSelect={() => runSearch(term)} />
                  ))}
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-3">
                <SearchSectionHeading>Trending destinations</SearchSectionHeading>
                {/* Two across on a phone, four on the wide header popover */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-4">
                  {suggestions.map((city) => (
                    <SuggestionRow
                      key={city.id}
                      name={city.name}
                      subtitle="City in Kenya"
                      onSelect={() => handleSelectLocation(city)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Typing — a results header, type tabs, then results grouped by type */}
        {hasQuery && (
          <div className="p-5">
            {isSearching ? (
              <div className="space-y-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 py-2">
                    <div className="h-14 w-14 animate-pulse rounded-xl bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/5 animate-pulse rounded bg-gray-100" />
                      <div className="h-3 w-3/5 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : total === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No results for &ldquo;{query?.trim()}&rdquo;
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="text-lg font-bold text-gray-900">
                    {total} {total === 1 ? 'result' : 'results'} for &ldquo;{query?.trim()}&rdquo;
                  </p>

                  <div className="sm:flex-shrink-0">
                    <SimplePillFilters
                      variant="panel"
                      filters={typeTabs}
                      selected={typeFilter}
                      onChange={(value) => setTypeFilter(value as TypeFilter)}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-8">
                  {showGroup('experience') && experiences.length > 0 && (
                    <ResultGroup
                      title="Experiences"
                      count={`${counts?.experience} ${counts?.experience === 1 ? 'experience' : 'experiences'}`}
                    >
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {experiences.map((experience) => (
                          <ExperienceResultRow
                            key={experience.id}
                            item={experience}
                            onClick={() => go('experience', experience.id)}
                          />
                        ))}
                      </div>
                    </ResultGroup>
                  )}

                  {showGroup('place') && places.length > 0 && (
                    <ResultGroup
                      title="Places"
                      count={`${counts?.place} ${counts?.place === 1 ? 'place' : 'places'}`}
                    >
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {places.map((place) => (
                          <PlaceResultRow
                            key={place.id}
                            item={place}
                            onClick={() => go('place', place.id)}
                          />
                        ))}
                      </div>
                    </ResultGroup>
                  )}

                  {showGroup('community') && communities.length > 0 && (
                    <ResultGroup
                      title="Communities"
                      count={`${counts?.community} ${counts?.community === 1 ? 'community' : 'communities'}`}
                    >
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {communities.map((community) => (
                          <CommunityResultRow
                            key={community.id}
                            item={community}
                            onClick={() => go('community', community.id)}
                          />
                        ))}
                      </div>
                    </ResultGroup>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
