'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { debounce } from 'lodash';

import { FiltersDialog } from '@/app/shared/components/Filters';
import { paramsFromFilters } from '@/app/shared/components/Filters/filters';
import { IconComponent } from '@/app/shared/components/Icons';
import { useLocation } from '@/context/LocationContext';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { PlaceCategory } from '@/types/placeCategory';
import { EMPTY_FILTERS, ResultType, SearchFilters } from '@/types/search';

import { SearchBarShell } from './SearchBarShell';

/**
 * "Looking for" starts on whichever tab the reader is already on - Experiences
 * on Experiences, Places on Places - and Everything anywhere else (Discover,
 * Moments, a detail page, ...).
 */
const defaultTypeFor = (pathname: string): ResultType => {
  if (pathname === '/experiences' || pathname.startsWith('/experiences/')) return 'experiences';
  if (pathname === '/places' || pathname.startsWith('/places/')) return 'places';
  return 'all';
};

const DEBOUNCE_MS = 400;

/**
 * The header search bar.
 *
 * Results never render here - typing takes the reader straight to Discover's
 * own results view (`SearchResults`), the same place a filter's "Show all"
 * button leads. One results layout, not two.
 *
 * The navigation itself is debounced, so a pause in typing is enough - Enter
 * and the search button still fire immediately, cancelling anything pending.
 */
export const Search = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSelectedCitySearchId } = useSelectedCategory();
  const { city, area, isUsingLocation } = useLocation();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<PlaceCategory | undefined>();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isFieldEmpty, setIsFieldEmpty] = useState(true);
  const inputElRef = useRef<HTMLInputElement | null>(null);
  // Read by `handleSubmitSearch`, so the debounced wrapper below can be built
  // once (empty deps) and still never see a stale tag
  const tagRef = useRef(tag);
  tagRef.current = tag;

  const removeTag = () => {
    setTag(undefined);
    setSelectedCitySearchId('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('city');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // What the Filters dialog opens on - the query and city tag this bar
  // already carries, narrowed no further until the reader picks something,
  // with "Looking for" starting on the tab the reader is already on
  const filtersDraft: SearchFilters = {
    ...EMPTY_FILTERS,
    type: defaultTypeFor(pathname),
    query,
    city: tag?.id,
  };

  /**
   * Filters live in the URL on Discover, same as a submitted search - so
   * applying one is a navigation there, not a local state change.
   */
  const applyFilters = (next: SearchFilters) => {
    setIsFiltersOpen(false);
    const params = paramsFromFilters(next);
    router.push(params.toString() ? `/?${params.toString()}` : '/');
  };

  /**
   * Takes the reader to Discover's results view, which reads the URL.
   *
   * Replaces rather than pushes: this fires on every pause while typing (see
   * the debounced wrapper below), and a push per keystroke-pause would leave
   * the back button stepping through every near-duplicate search instead of
   * out of the bar entirely.
   */
  const handleSubmitSearch = () => {
    const typed = inputElRef.current?.value ?? '';
    if (!typed.trim()) return;

    const params = new URLSearchParams();
    params.set('q', typed.trim());
    if (tagRef.current) params.set('category', tagRef.current.id);

    router.replace(`/?${params.toString()}`);
  };

  // Built once - everything it reads goes through a ref or `router` (stable
  // in Next.js), so the closure never goes stale across renders
  const debouncedSubmit = useMemo(() => debounce(handleSubmitSearch, DEBOUNCE_MS), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => debouncedSubmit.cancel(), [debouncedSubmit]);

  return (
    <FiltersDialog
      filters={filtersDraft}
      isOpen={isFiltersOpen}
      onClose={() => setIsFiltersOpen(false)}
      onApply={applyFilters}
    >
      <div className="my-4 w-full md:my-0">
        <SearchBarShell
          // Where the reader actually is, once that is known - "Near me"
          // only while it is still being worked out
          cityLabel={isUsingLocation ? (area ?? city ?? 'Near me') : (city ?? 'Nairobi')}
          isLocationOn={isUsingLocation}
          onFilters={() => setIsFiltersOpen(true)}
          filterCount={tag ? 1 : 0}
          isFilterOpen={isFiltersOpen}
          canSearch={!isFieldEmpty}
          onSearch={() => {
            debouncedSubmit.cancel();
            handleSubmitSearch();
          }}
        >
          {/* The Filters dialog seeds its own category pick from this tag but
          does not write back to it, so the chip's own close button stays the
          one way to drop a city filter from the bar itself. */}
          {tag && (
            <span className="mr-2 inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-surface py-1 pl-2.5 pr-1 text-[13px] font-medium text-brand-ink">
              {tag.name}
              <button
                type="button"
                aria-label={`Clear ${tag.name}`}
                onClick={(event) => {
                  event.stopPropagation();
                  removeTag();
                }}
                className="flex h-5 w-5 items-center justify-center rounded-full text-ink-subtle transition-colors hover:text-brand-ink"
              >
                <IconComponent iconName="Cancel01Icon" size={12} color="currentColor" />
              </button>
            </span>
          )}

          <input
            ref={inputElRef}
            type="text"
            aria-label="Search Tukai"
            placeholder="Experiences, places, lists, communities"
            className="min-w-0 flex-1 border-none bg-transparent text-[13.5px] font-medium text-gray-900 outline-none placeholder:text-ink-subtle"
            onChange={(event) => {
              setIsFieldEmpty(event.target.value.length === 0);
              setQuery(event.target.value);
              debouncedSubmit();
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              debouncedSubmit.cancel();
              handleSubmitSearch();
            }}
          />
        </SearchBarShell>
      </div>
    </FiltersDialog>
  );
};
