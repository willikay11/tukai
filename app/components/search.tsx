'use client';
import { Search01Icon } from '@hugeicons/react-pro';
import { usePathname } from 'next/navigation';
import { useSearch } from '@/hooks/search';
import { useState, useRef, useEffect } from 'react';
import { debounce } from 'lodash';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import TukaiImage from '@/components/ui/image';
import { SearchResult } from '@/types/search';
import IconComponent from './iconComponent';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePlaceCategories } from '@/hooks/places';
import { PlaceCategory } from '@/types/placeCategory';
import clsx from 'clsx';

export default function Search() {
  const pathname = usePathname();
  const { data: placeCategories } = usePlaceCategories({ pageSize: 100, group: 'cities' });
  const [query, setQuery] = useState<string>();
  const [tag, setTag] = useState<PlaceCategory | undefined>();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { data: searchResults } = useSearch(query, tag?.id);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputElRef = useRef<HTMLInputElement | null>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);

  const removeTag = () => {
    setTag(undefined);
  };

  useEffect(() => {
    if (containerRef.current) {
      setPopoverWidth(containerRef.current.offsetWidth);
    }
  }, [containerRef.current]);

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
      <PopoverTrigger asChild>
        <div
          ref={containerRef}
          className="relative inline-flex h-10 w-full items-center justify-between rounded-full border-[1px] border-gray-200 bg-white py-4 pl-4 pr-1"
        >
          <Search01Icon size={20} className="mr-2 text-gray-500" variant="twotone" />
          <div
            onClick={() => setShowSearchResults(true)}
            className={clsx('flex w-[80%]', {
              'mt-0 flex-row items-center': (query && query.length > 0) || tag,
              'flex-col': !query && !tag,
            })}
          >
            {!query && !tag && (
              <p className="mb-0 text-xs text-gray-700 font-medium">
                {pathname === '/' || pathname.includes('/place')
                  ? "What's the plan?"
                  : pathname.includes('/experiences')
                    ? 'Find Experiences?'
                    : 'Find Your Communities?'}
              </p>
            )}
            {tag && (
              <span
                className="mr-2 inline-flex cursor-pointer items-center gap-1 rounded-full bg-gray-100 py-1 pl-2 pr-1 text-sm"
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
              className={clsx(
                'mt-[2px] h-full w-full text-[11px] outline-0 placeholder:text-[11px] placeholder:text-gray-400 placeholder:font-medium hover:border-primary focus:border-primary',
                query && query.length > 0 && tag && 'mt-0',
              )}
              placeholder={
                pathname === '/' || pathname.includes('/place')
                  ? 'Any City . Any day'
                  : pathname.includes('/experiences')
                    ? 'Any City . By Activity'
                    : 'Any City . By Activity'
              }
              onChange={(e) => {
                debounce(() => {
                  setQuery(e.target.value);
                }, 500)();
              }}
            />
          </div>
          <div
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-gray-100"
            onClick={() => {
              setShowSearchResults(false);
              setQuery(undefined);
              setTag(undefined);
              inputElRef.current!.value = '';
            }}
          >
            <IconComponent
              iconName={
                showSearchResults || query?.length ? 'Cancel01Icon' : 'FilterHorizontalIcon'
              }
              size={15}
              color="gray"
            />
          </div>
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
            <div className="mb-2 flex items-center gap-2 overflow-x-auto scroll-smooth no-scrollbar">
              {tag === undefined &&
                placeCategories?.data?.results.map((category: PlaceCategory) => (
                  <div
                    className="relative h-[100px] w-[100px] flex-shrink-0 cursor-pointer"
                    onClick={() => setTag(category)}
                  >
                    <TukaiImage
                      src={category?.image}
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
                href={`/${result.type === 'experience' ? 'experiences' : 'place'}/${result.data?.id}`}
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
}
