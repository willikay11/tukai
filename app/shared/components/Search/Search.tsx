'use client';

import { useEffect, useRef, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Search01Icon } from '@hugeicons/react-pro';
import { debounce } from 'lodash';

import { IconComponent } from '@/app/shared/components/Icons';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useSearch } from '@/app/shared/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { PlaceCategory } from '@/types/placeCategory';
import { SearchResult } from '@/types/search';

import { ResultRow } from './ResultRow';
import { SuggestionRow } from './SuggestionRow';

const SUGGESTION_LIMIT = 6;

export const Search = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSelectedCitySearchId } = useSelectedCategory();
  const { data: placeCategories } = usePlaceCategories({ pageSize: 100, group: 'cities' }, true);
  const [query, setQuery] = useState<string>();
  const [tag, setTag] = useState<PlaceCategory | undefined>();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { data: searchResults, isFetching: isSearching } = useSearch(query, tag?.id);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputElRef = useRef<HTMLInputElement | null>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);

  const hasQuery = Boolean(query?.trim());

  // Location suggestions come from the curated cities categories — there is
  // no dedicated suggestions endpoint. When typing, narrow them by name.
  const cities: PlaceCategory[] = placeCategories?.data?.results ?? [];
  const suggestions = (
    hasQuery
      ? cities.filter((city) => city.name.toLowerCase().includes(query!.trim().toLowerCase()))
      : cities
  ).slice(0, SUGGESTION_LIMIT);

  const removeTag = () => {
    setTag(undefined);
    setSelectedCitySearchId('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('city');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    if (containerRef.current) {
      setPopoverWidth(containerRef.current.offsetWidth);
    }
  }, []);

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

  const handleSelectResult = (result: SearchResult) => {
    setShowSearchResults(false);
    const basePath =
      result.type === 'experience'
        ? '/experiences'
        : result.type === 'place'
          ? '/places'
          : '/communities';
    router.push(`${basePath}/${result.data.id}`);
  };

  return (
    <Popover open={showSearchResults} onOpenChange={(isOpen) => setShowSearchResults(isOpen)}>
      <PopoverTrigger asChild className="my-4 md:my-0">
        {/* The wrapper stays a plain box: it anchors the popover and is measured
            to size it, so it needs a ref the field itself cannot give it */}
        <div ref={containerRef} className="relative w-full">
          <Input
            shape="pill"
            ref={inputElRef}
            placeholder="Search places or activities"
            // Tighter than the standard 13px/16px because a full-height button
            // sits inside the pill
            containerClassName="w-full bg-white py-1.5 pl-4 pr-1.5 shadow-search-bar"
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
                onClick={() => setShowSearchResults(true)}
                className="flex-shrink-0 rounded-full px-6"
              >
                Search
              </Button>
            }
            onClick={() => setShowSearchResults(true)}
            onFocus={() => setShowSearchResults(true)}
            onChange={(e) => {
              debounce(() => {
                setQuery(e.target.value);
              }, 500)();
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="max-h-[70vh] overflow-y-auto rounded-2xl border-gray-100 p-0 py-3 shadow-xl"
        style={{ width: popoverWidth }}
      >
        {/* Suggestions — shown in both states */}
        {suggestions.length > 0 && (
          <div>
            <p className="px-4 py-2 text-sm font-medium text-gray-400">Suggestions</p>
            {suggestions.map((city) => (
              <SuggestionRow
                key={city.id}
                name={city.name}
                subtitle="City in Kenya"
                onSelect={() => handleSelectLocation(city)}
              />
            ))}
          </div>
        )}

        {/* Results — only when the user has typed */}
        {hasQuery && (
          <>
            {suggestions.length > 0 && <div className="my-2 border-t border-gray-100" />}

            <p className="px-4 py-2 text-sm font-medium text-gray-400">Results</p>

            {isSearching ? (
              <div className="space-y-1 px-4 py-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 py-2">
                    <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-2/5 animate-pulse rounded bg-gray-100" />
                      <div className="h-3 w-3/5 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              searchResults.map((result: SearchResult) => (
                <ResultRow
                  key={result.id}
                  result={result}
                  onSelect={() => handleSelectResult(result)}
                />
              ))
            ) : (
              <p className="px-4 py-6 text-center text-sm text-gray-400">
                No results for &ldquo;{query?.trim()}&rdquo;
              </p>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
