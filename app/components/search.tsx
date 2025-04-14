'use client';
import { Search01Icon, FilterHorizontalIcon } from '@hugeicons/react-pro';
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
import Image from 'next/image';
import { usePlaceCategories } from '@/hooks/places';
import { PlaceCategory } from '@/types/placeCategory';

export default function Search() {
  const pathname = usePathname();
  const { data: placeCategories } = usePlaceCategories();
  const [query, setQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const { data: searchResults } = useSearch(query, selectedCategory);
  const inputRef = useRef<HTMLDivElement | null>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (inputRef.current) {
      setPopoverWidth(inputRef.current.offsetWidth);
    }
  }, [inputRef.current]);

  useEffect(() => {
    if (searchResults) {
      setShowSearchResults(true);
    }
  }, [searchResults]);

  return (
    <Popover open={showSearchResults} onOpenChange={() => setShowSearchResults(false)}>
      <PopoverTrigger asChild>
        <div
          ref={inputRef}
          className="relative inline-flex h-10 w-full items-center justify-between rounded-full border-[1px] border-gray-200 bg-white py-4 pl-4 pr-1"
        >
          <Search01Icon size={20} className="mr-2 text-gray-500" variant="twotone" />
          <div className="flex w-full flex-col md:w-[90%]">
            <p className="mb-0 text-xs text-gray-700">
              {pathname === '/' || pathname.includes('/place')
                ? "What's the plan?"
                : pathname.includes('/experiences')
                  ? 'Find Experiences?'
                  : 'Find Your Communities?'}
            </p>
            <input
              className="mt-[2px] h-full w-full text-[11px] outline-0 placeholder:text-[11px] placeholder:text-gray-400 hover:border-primary focus:border-primary"
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
          <div className="ml-2 flex h-[30px] w-[36px] items-center justify-center rounded-full bg-gray-100">
            <FilterHorizontalIcon className="text-gray-800" size={15} variant="twotone" />
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
              {placeCategories?.data?.results
                ?.filter((category: PlaceCategory) => category.group === 'cities')
                .map((category: PlaceCategory) => (
                  <div
                    className="relative w-[100px] flex-shrink-0 cursor-pointer"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Image
                      src={category?.image ?? ''}
                      alt={category.name}
                      className="rounded-[8px]"
                      width={100}
                      height={100}
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
