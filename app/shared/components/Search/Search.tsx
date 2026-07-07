'use client';

import { useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Search01Icon } from '@hugeicons/react-pro';
import { debounce } from 'lodash';

import { IconComponent } from '@/app/shared/components/Icons';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useSearch } from '@/app/shared/hooks/useSearch';
import { Button } from '@/components/ui/button';
import { TukaiImage } from '@/components/ui/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { cn } from '@/lib/utils';
import { PlaceCategory } from '@/types/placeCategory';
import { SearchResult } from '@/types/search';

export const Search = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSelectedCitySearchId } = useSelectedCategory();
  const { data: placeCategories } = usePlaceCategories({ pageSize: 100, group: 'cities' }, true);
  const [query, setQuery] = useState<string>();
  const [tag, setTag] = useState<PlaceCategory | undefined>();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { data: searchResults } = useSearch(query, tag?.id);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputElRef = useRef<HTMLInputElement | null>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);

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

  return (
    <Popover open={showSearchResults} onOpenChange={(isOpen) => setShowSearchResults(isOpen)}>
      <PopoverTrigger asChild className="my-4 md:my-0">
        <div
          ref={containerRef}
          className="relative flex w-full items-center gap-2 rounded-full border-[1px] border-gray-200 bg-white py-1.5 pl-4 pr-1.5 shadow-search-bar"
        >
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
          <input
            ref={inputElRef}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            placeholder="Search places or activities"
            onClick={() => setShowSearchResults(true)}
            onChange={(e) => {
              debounce(() => {
                setQuery(e.target.value);
              }, 500)();
            }}
          />

          {/* Divider */}
          <div className="h-6 w-px flex-shrink-0 bg-gray-200" />

          {/* Anytime dropdown (placeholder) */}
          <button
            type="button"
            className="flex flex-shrink-0 items-center gap-1 px-2 text-sm font-medium text-gray-800"
          >
            Anytime
            <IconComponent iconName="ArrowDown01Icon" size={14} className="text-gray-500" />
          </button>

          {/* Search button */}
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setShowSearchResults(true)}
            className="flex-shrink-0 rounded-full px-6"
          >
            Search
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="flex max-h-[50vh] min-h-24 flex-col gap-2 overflow-y-auto rounded-[15px] border-gray-200 shadow-md"
        style={{ width: popoverWidth }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <div className="inline-flex w-full items-center justify-between">
              <p className="text-sm font-bold text-gray-700">Cities</p>
              <Button variant="text" className="text-sm text-primary">
                See All
                <IconComponent iconName="ArrowRight01Icon" size={15} color="primary" />
              </Button>
            </div>
            <div className="mb-2 flex items-center gap-2 overflow-x-auto scroll-smooth scrollbar-hide">
              {placeCategories?.data?.results.map((category: PlaceCategory) => (
                <div
                  key={category.id}
                  className="relative h-[100px] w-[100px] flex-shrink-0 cursor-pointer"
                  onClick={() => {
                    setTag(category);
                    setSelectedCitySearchId(category.id);
                    setShowSearchResults(false);
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('city', category.id);
                    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
                  }}
                >
                  <TukaiImage
                    src={category?.image ?? ''}
                    alt={category.name}
                    className="rounded-[8px]"
                    showNotFoundText={false}
                  />
                  <p className="absolute bottom-0.5 left-0.5 p-1 text-xs font-bold text-white">
                    {category.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {searchResults?.map((result: SearchResult) => (
              <Link
                href={`/${result.type === 'experience' ? 'experiences' : 'places'}/${result.data?.id}`}
                target="_blank"
                key={result.id}
              >
                <div className="flex cursor-pointer flex-row gap-2">
                  <div className={cn('relative aspect-square w-1/4')}>
                    <TukaiImage
                      src={
                        result.data?.photos?.find((photo) => photo.isCover)?.photo ??
                        result.data?.photos[0].photo
                      }
                      alt={result.data?.title}
                      className="rounded-[8px]"
                    />
                    <div className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 bg-opacity-50">
                      <IconComponent
                        iconName={
                          result.type === 'experience' ? 'Calendar01Icon' : 'Directions01Icon'
                        }
                        size={12}
                        color="white"
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-sm font-bold text-gray-700">{result.data?.title}</p>
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {result.data?.location?.formattedAddress}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
