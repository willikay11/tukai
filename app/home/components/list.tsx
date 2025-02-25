'use client';
import Link from 'next/link';
import { motion } from 'framer-motion'; // ✅ Framer Motion for smooth transitions
import SinglePlace from '@/app/home/components/place';
import { Place } from '@/types/place';
import { usePlaces } from '@/hooks/places';
import { EventSkeleton, EventsSkeleton } from '@/app/components/skeletons';
import { useCallback, useRef, useState, useEffect } from 'react';

type ListPlacesProps = {
  selectedCategoryId?: string;
};

export default function ListPlaces({ selectedCategoryId }: ListPlacesProps) {
  const [page, setPage] = useState(1);
  const [placeList, setPlaceList] = useState<Place[]>([]);
  const [endPage, setEndPage] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false); // ✅ Track if fetching

  const { data: places, isLoading } = usePlaces({
    categoryId: selectedCategoryId,
    page,
    enabled: true,
  });

  const observer = useRef<IntersectionObserver | null>(null);

  const lastPlaceElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isFetching || !places?.data?.results || (endPage !== null && page > endPage))
        return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setIsFetching(true);
          setTimeout(() => {
            setPage((prevPage) => prevPage + 1);
          }, 500);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetching, places, page, endPage],
  );

  useEffect(() => {
    if (places?.data?.results) {
      setPlaceList((prevPlaceList) => [...prevPlaceList, ...places.data.results]);
      if (places.data.end_index) {
        setEndPage(places.data.end_index);
      }
    }
    setIsFetching(false);
  }, [places]);

  return (
    <>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: placeList.length > 0 ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className={placeList.length > 0 ? 'hidden' : 'block'}
      >
        <EventsSkeleton />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7"
      >
        {placeList.map((place: Place, index: number) => {
          const isLastElement = index === placeList.length - 1;
          return (
            <motion.div
              key={place.id}
              ref={isLastElement ? lastPlaceElementRef : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer"
            >
              <Link target="_blank" href={`/experiences/${place.id}`}>
                <SinglePlace place={place} />
              </Link>
            </motion.div>
          );
        })}

        {isFetching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="contents"
          >
            {Array.from({ length: 12 }).map((_, index) => (
              <EventSkeleton key={index} />
            ))}
          </motion.div>
        )}
      </motion.div>
    </>
  );
}
