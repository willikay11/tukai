'use client';

import { useEffect, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { PillsSkeleton } from '@/app/shared/components/Cards';
import {
  type CategoryChip,
  CategoryChipRow,
} from '@/app/shared/components/Filters/CategoryChipRow';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { cn } from '@/lib/utils';
import { PlaceCategory } from '@/types/placeCategory';

const ALL_CATEGORIES = 'all';

/**
 * Interest categories lead the row, then the rest by how many places they
 * hold. Cities are a location, not a category, so they never become a chip.
 *
 * No All chip: with it gone, the row would otherwise load with nothing
 * active, so the first chip in this order is selected by default instead -
 * same as the reader clicking it themselves.
 */
const chipsFrom = (categories: PlaceCategory[]): CategoryChip[] =>
  categories
    .filter((category) => category.group !== 'cities')
    .sort(
      (a, b) =>
        Number(b.group === 'interests') - Number(a.group === 'interests') ||
        b.placesCount - a.placesCount,
    )
    .map((category) => ({
      value: category.id,
      label: category.name,
      icon: category.icon || undefined,
    }));

export const PageFilters = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { selectedCategoryId, setSelectedCategoryId } = useSelectedCategory();
  const { data: categories, isFetching } = usePlaceCategories(
    { pageSize: 100 },
    pathname === '/places',
  );
  const categoryFromQuery = searchParams.get('category');

  const results = categories?.data?.results as PlaceCategory[] | undefined;
  const chips = useMemo(() => (results?.length ? chipsFrom(results) : []), [results]);

  useEffect(() => {
    if (pathname === '/places' && chips.length) {
      setSelectedCategoryId(categoryFromQuery || chips[0].value);
    }
  }, [chips, pathname, categoryFromQuery, setSelectedCategoryId]);

  // Hide filters on Discover, Experiences and Communities (which render their
  // own tabs), Moments and Bucket Lists (no categories to filter by - either
  // would otherwise sit on the skeleton forever, since only the /places branch
  // ever clears isLoading), detail pages (with IDs), and the Dashboard (a host
  // dashboard, not browsable content)
  if (
    pathname === '/' ||
    pathname === '/experiences' ||
    pathname === '/communities' ||
    pathname.startsWith('/moments') ||
    pathname.startsWith('/bucket-lists') ||
    pathname.startsWith('/places/') ||
    pathname.startsWith('/experiences/') ||
    pathname.startsWith('/communities/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/help') ||
    pathname.startsWith('/unsubscribe')
  ) {
    return null;
  }

  const handleChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);

    // The URL keeps the choice, so a reload or a shared link lands on it
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', categoryId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: true });
  };

  // Sticks under the top bar, whose height `TopBar` measures into
  // --top-bar-h: it changes with the width, and on a phone with whether the
  // search shows.
  const showRow = isFetching || chips.length > 0;

  return (
    <div
      className={cn(
        showRow &&
          'sticky top-[var(--top-bar-h,0px)] z-20 border-b border-gray-100 bg-white pb-3 pt-4',
      )}
    >
      <div className="mx-auto w-full max-w-[1360px] px-6">
        <div className="w-full">
          <div className="grid grid-cols-12 gap-4">
            <div className="relative col-span-12">
              {isFetching ? (
                <PillsSkeleton />
              ) : (
                // Hidden when there is nothing to filter by at all
                chips.length > 0 && (
                  <CategoryChipRow
                    chips={chips}
                    value={selectedCategoryId ?? chips[0]?.value ?? ALL_CATEGORIES}
                    onChange={handleChange}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
