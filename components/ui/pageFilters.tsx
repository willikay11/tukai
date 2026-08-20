'use client';

import { useEffect, useState } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';

import { PillsSkeleton } from '@/app/shared/components/Cards';
import { ScrollFilters } from '@/app/shared/components/Filters';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { PlaceCategory } from '@/types/placeCategory';

export const PageFilters = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { setSelectedCategoryId } = useSelectedCategory();
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
        categories?.data?.results
          ?.sort((a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount)
          ?.filter((placeCategory: PlaceCategory) => placeCategory.group !== 'cities')?.[0].id;

      setIsLoading(false);
      setSelectedCategoryId(selectedCategoryId);
    }

    if (pathname === '/communities') {
      setFilters([
        { label: 'Recommended', value: 'recommended', icon: 'UserSearch01Icon' },
        { label: 'My Communities', value: 'my-communities', icon: 'UserGroupIcon' },
        { label: 'Posts', value: 'posts', icon: 'GridViewIcon' },
      ]);
      setIsLoading(false);
      if (categoryFromQuery == null) {
        setSelectedCategoryId('recommended');
      } else {
        setSelectedCategoryId(categoryFromQuery);
      }
    }
  }, [categories, pathname, categoryFromQuery, setSelectedCategoryId]);

  // Hide filters on Discover, Experiences (which renders its own tabs), Moments
  // (a photo feed with no categories — it would otherwise sit on the skeleton
  // forever, since no branch above ever clears isLoading), detail pages (with
  // IDs), and Creator Studio (a host dashboard, not browsable content)
  if (
    pathname === '/' ||
    pathname === '/experiences' ||
    pathname.startsWith('/moments') ||
    pathname.startsWith('/places/') ||
    pathname.startsWith('/experiences/') ||
    pathname.startsWith('/communities/') ||
    pathname.startsWith('/creator-studio') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/help') ||
    pathname.startsWith('/unsubscribe')
  ) {
    return null;
  }

  return (
    <div className="">
      <div className="col-span-12 gap-4 px-4 md:px-0">
        <div className="w-full">
          <div className="grid grid-cols-12 gap-4">
            <div className="relative col-span-12 md:col-span-10 md:col-start-2 md:mx-0 lg:col-span-10 lg:col-start-2 xl:col-span-10 xl:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
              {isFetching || isLoading ? (
                <PillsSkeleton />
              ) : (
                <ScrollFilters filters={filters || []} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
