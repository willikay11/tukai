'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Place } from '@/types/place';
import { usePlaces } from '@/hooks/places';
import { useCallback, useRef, useState, useEffect } from 'react';
import NoData from '@/components/ui/noData';
import { Status } from '@/enums/status';
import SinglePlace from './place';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';

const placeholders: Place[] = Array.from({ length: 12 }, (_, index) => ({
  id: `placeholder-${index}`,
  title: 'Loading...',
  description: '',
  location: {
    id: '',
    name: '',
    pointLat: 0,
    pointLong: 0,
    point: { type: 'Point', coordinates: [0, 0] },
    formattedAddress: '',
    street: '',
    city: '',
    state: '',
    country: '',
  },
  category: { id: '', name: '', icon: '', group: '', placesCount: 0 },
  dateCreated: '',
  photos: [],
  totalReviews: 0,
  averageRating: 0,
  isBookmarked: false,
  status: 'DRAFT' as Status,
  categories: [],
}));

export default function ListPlaces() {
  const { selectedCategoryId } = useSelectedCategory();
  const [page, setPage] = useState(1);
  const [placeList, setPlaceList] = useState<Place[]>(placeholders);
  const [endPage, setEndPage] = useState<number | null>(null);
  const { data: places, isLoading } = usePlaces({
    categoryId: selectedCategoryId,
    page,
    enabled: true,
  });

  const observer = useRef<IntersectionObserver | null>(null);

  const lastPlaceElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || !places?.data?.results) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && endPage !== null && page < endPage) {
          setTimeout(() => {
            setPage((prevPage) => prevPage + 1);
          }, 500);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, places, page, endPage],
  );

  useEffect(() => {
    if (isLoading && !placeList.some((place) => place.id.startsWith('placeholder-'))) {
      setPlaceList((prevPlaceList) => [...prevPlaceList, ...placeholders]);
      ``;
    } else if (!isLoading && places?.data?.results) {
      setPlaceList((prevPlaceList) => [
        ...prevPlaceList.filter((place) => !place.id.startsWith('placeholder-')),
        ...places.data.results,
      ]);
      if (places.data.count) {
        setEndPage(Math.ceil(places.data.count / 12));
      }
    } else if (!isLoading) {
      setPlaceList((prevPlaceList) =>
        prevPlaceList.filter((place) => !place.id.startsWith('placeholder-')),
      );
    }
  }, [places, isLoading]);

  if (!isLoading && placeList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <NoData message="No places found" />
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        key={selectedCategoryId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6"
      >
        {placeList.map((place: Place, index: number) => {
          const isLastElement = index === placeList.length - 1;
          return (
            <motion.div
              key={place.id}
              ref={isLastElement && !isLoading ? lastPlaceElementRef : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="cursor-pointer"
            >
              <Link target="_blank" href={`/places/${place.id}`}>
                <SinglePlace place={place} />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}
