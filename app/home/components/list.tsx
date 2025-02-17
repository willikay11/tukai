'use client';
import Link from 'next/link';
import SinglePlace from '@/app/home/components/place';
import { Place } from '@/types/place';
import { usePlaces } from '@/hooks/places';
import { EventsSkeleton } from '@/app/components/skeletons';
import { useCallback, useRef, useState, useEffect } from 'react';

type ListPlacesProps = {
  selectedCategoryId?: string;
};

export default function ListPlaces({ selectedCategoryId }: ListPlacesProps) {
  const [page, setPage] = useState(1);
  const [placeList, setPlaceList] = useState<Place[]>([]); // Local state for places

  const {
    data: places,
    isLoading,
    isFetchingNextPage,
  } = usePlaces({
    categoryId: selectedCategoryId,
    page,
    enabled: true,
  });

  const observer = useRef<IntersectionObserver | null>(null);

  const lastPlaceElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1); // Fetch next page when the last item is visible
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingNextPage],
  );

  // Append new places to the existing list when new data is fetched
  useEffect(() => {
    if (places?.data?.results) {
      setPlaceList((prevPlaceList) => [...prevPlaceList, ...places.data.results]);
    }
  }, [places]); // Runs whenever new places are fetched

  if (isLoading && page === 1) return <EventsSkeleton />;
  if (!placeList.length) return <EventsSkeleton />;

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
      {placeList.map((place: Place, index: number) => {
        const isLastElement = index === placeList.length - 1;

        return (
          <div
            key={place.id}
            ref={isLastElement ? lastPlaceElementRef : undefined}
            className="cursor-pointer"
          >
            <Link href={`/experiences/${place.id}`}>
              <SinglePlace place={place} />
            </Link>
          </div>
        );
      })}
      {isFetchingNextPage && <EventsSkeleton />}
    </div>
  );
}
