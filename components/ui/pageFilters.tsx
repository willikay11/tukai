'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import ScrollFilters from '@/app/components/scrollFilters';
import { PillsSkeleton } from '@/app/components/skeletons';
import { Suspense, useEffect, useState } from 'react';
import { usePlaceCategories } from '@/hooks/places';
import { PlaceCategory } from '@/types/placeCategory';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';

export default function PageFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { setSelectedCategoryId, selectedCategoryId } = useSelectedCategory();
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] =
    useState<{ label: string; value: string; icon: string; shouldBeLoggedIn?: boolean }[]>();
  const { data: categories, isFetching } = usePlaceCategories(
    { pageSize: 100 },
    pathname === '/places',
  );
  const categoryFromQuery = searchParams.get('category');

  useEffect(() => {
    if (pathname === '/places' && categories?.data?.results?.length) {
      setFilters(
        categories?.data?.results
          ?.sort((a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount)
          ?.filter((placeCategory: PlaceCategory) => placeCategory.group !== 'cities')
          ?.map((placeCategory: PlaceCategory) => ({
            label: placeCategory.name,
            value: placeCategory.id,
            icon: placeCategory.icon,
          })),
      );

      const selectedCategoryId =
        categoryFromQuery ||
        categories?.data?.results?.sort(
          (a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount,
        )?.[0].id;
      setIsLoading(false);
      setSelectedCategoryId(selectedCategoryId);
    }

    if (pathname === '/' || pathname === '/experiences') {
      setFilters([
        { label: 'All Experiences', value: 'all', icon: 'WorkoutStretchingIcon' },
        {
          label: 'Reserved Experiences',
          value: 'reserved',
          icon: 'CalendarAdd01Icon',
          shouldBeLoggedIn: true,
        },
        { label: 'Saved', value: 'saved', icon: 'Bookmark02Icon', shouldBeLoggedIn: true },
        { label: 'Hosting', value: 'hosting', icon: 'WavingHand02Icon', shouldBeLoggedIn: true },
      ]);
      setIsLoading(false);
      if (categoryFromQuery == null) {
        setSelectedCategoryId('all');
      } else {
        setSelectedCategoryId(categoryFromQuery);
      }
    }
    if (pathname === '/communities') {
      setFilters([
        { label: 'My Communities', value: 'my-communities', icon: 'UserGroupIcon' },
        { label: 'Recommended', value: 'recommended', icon: 'UserSearch01Icon' },
        { label: 'Posts', value: 'posts', icon: 'GridViewIcon' },
      ]);
      setIsLoading(false);
    }
  }, [categories, pathname]);

  // Hide filters on detail pages (with IDs)
  if (
    pathname.startsWith('/places/') ||
    pathname.startsWith('/experiences/') ||
    pathname.startsWith('/communities/') ||
    pathname.startsWith('/auth/')
  ) {
    return null;
  }

  return (
    <div className="col-span-12 gap-4 border-t-[1px] border-gray-100 px-4 md:px-0">
      <div className="w-full bg-white">
        <div className="grid grid-cols-12 gap-4">
          <div className="relative col-span-12 md:col-span-10 md:col-start-2 md:mx-0">
            {isFetching || isLoading ? (
              <PillsSkeleton />
            ) : (
              <ScrollFilters filters={filters || []} selectedCategory={selectedCategoryId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
