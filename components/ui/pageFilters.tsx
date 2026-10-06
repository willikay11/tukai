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
 */
const chipsFrom = (categories: PlaceCategory[]): CategoryChip[] => {
  const sorted = categories
    .filter((category) => category.group !== 'cities')
    .sort(
      (a, b) =>
        Number(b.group === 'interests') - Number(a.group === 'interests') ||
        b.placesCount - a.placesCount,
    );

  return [
    { value: ALL_CATEGORIES, label: 'All' },
    ...sorted.map((category) => ({
      value: category.id,
      label: category.name,
      icon: category.icon || undefined,
    })),
  ];
};

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
    if (pathname === '/places' && results?.length) {
      setSelectedCategoryId(categoryFromQuery || ALL_CATEGORIES);
    }
  }, [results, pathname, categoryFromQuery, setSelectedCategoryId]);

  // Hide filters on Discover, Experiences and Communities (which render their
  // own tabs), Moments and Bucket Lists (no categories to filter by - either
  // would otherwise sit on the skeleton forever, since only the /places branch
  // ever clears isLoading), detail pages (with IDs), and Control Center (a host
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
    pathname.startsWith('/control-center') ||
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

  // Sticks under the top bar. The bar is sticky only from md up, so on a phone
  // the row sticks to the top of the screen. 143px is the desktop bar, worked
  // out from its classes in app/layout.tsx: the header is 68px (12px padding,
  // the 44px auth button, 12px padding) and the search row is 74px (the 54px
  // search bar and its 20px bottom padding), plus the bar's 1px border. Change
  // this if the bar changes.
  const showRow = isFetching || chips.length > 1;

  return (
    <div
      className={cn(
        showRow && 'sticky top-0 z-40 border-b border-gray-100 bg-white pb-3 pt-4 md:top-[143px]',
      )}
    >
      <div className="col-span-12 gap-4 px-4 md:px-0">
        <div className="w-full">
          <div className="grid grid-cols-12 gap-4">
            <div className="relative col-span-12 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
              {isFetching ? (
                <PillsSkeleton />
              ) : (
                // Hidden until there is more than the All chip, so no lone chip shows
                chips.length > 1 && (
                  <CategoryChipRow
                    chips={chips}
                    value={selectedCategoryId ?? ALL_CATEGORIES}
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
