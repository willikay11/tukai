'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';

import { NoData } from '@/components/ui/noData';
import { useLocation } from '@/context/LocationContext';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { Status } from '@/enums/status';
import { usePlaces } from '@/hooks/places';
import { Place } from '@/types/place';

import SinglePlace from './place';

const ITEMS_PER_PAGE = 12;

const placeholders: Place[] = Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({
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
  const { selectedCategoryId, selectedCitySearchId } = useSelectedCategory();
  const { lat, lng } = useLocation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [placeList, setPlaceList] = useState<Place[]>(placeholders);
  const [endPage, setEndPage] = useState<number | null>(null);
  const [isQueryEnabled, setIsQueryEnabled] = useState(true);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const prevCategoryKeyRef = useRef<string>('');
  const placeholdersAddedRef = useRef(false);
  const isInitialMount = useRef(true);

  // Memoize the category array to prevent unnecessary re-renders and duplicate queries
  const categoryIds = useMemo(
    () =>
      [selectedCategoryId, selectedCitySearchId].filter(
        (id): id is string => Boolean(id) && id !== '',
      ),
    [selectedCategoryId, selectedCitySearchId],
  );

  const { data: places, isLoading } = usePlaces({
    categoryId: categoryIds,
    page,
    enabled: isQueryEnabled,
    lat,
    lng,
  });

  // Handle category changes
  useEffect(() => {
    const currentKey = JSON.stringify({
      cat: selectedCategoryId || null,
      city: selectedCitySearchId || null,
    });

    if (prevCategoryKeyRef.current === currentKey) return;

    // Skip on initial mount
    if (isInitialMount.current) {
      prevCategoryKeyRef.current = currentKey;
      isInitialMount.current = false;
      return;
    }

    prevCategoryKeyRef.current = currentKey;
    observerRef.current?.disconnect();

    // Cancel ALL queries with the places key to prevent stale requests
    queryClient.cancelQueries({ queryKey: ['places'] });
    // Also remove all cached queries to ensure clean slate
    queryClient.removeQueries({ queryKey: ['places'] });

    // Reset all states synchronously in correct order
    placeholdersAddedRef.current = false;
    setIsQueryEnabled(false); // Disable FIRST to prevent any queries
    setPage(1);
    setPlaceList([]); // Clear list immediately
    setEndPage(null);

    // Re-enable query in next tick after state has settled
    const timeoutId = setTimeout(() => {
      setIsQueryEnabled(true);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [selectedCategoryId, selectedCitySearchId, queryClient]);

  // Handle data updates
  useEffect(() => {
    if (!places?.data?.results) return;

    if (page === 1) {
      setPlaceList(places.data.results);
    } else {
      setPlaceList((prev) => [
        ...prev.filter((place) => !place.id.startsWith('placeholder-')),
        ...places.data.results,
      ]);
    }

    if (places.data.count) {
      setEndPage(Math.ceil(places.data.count / ITEMS_PER_PAGE));
    }
  }, [places, page]);

  // Handle pagination placeholders and loading state
  useEffect(() => {
    if (!isLoading) {
      placeholdersAddedRef.current = false;
      return;
    }

    if (page === 1 && placeList.length === 0 && !placeholdersAddedRef.current) {
      // Show placeholders for page 1 when list is empty
      placeholdersAddedRef.current = true;
      setPlaceList(placeholders);
    } else if (page > 1 && !placeholdersAddedRef.current) {
      // Show placeholders for pagination
      placeholdersAddedRef.current = true;
      setPlaceList((prev) => [...prev, ...placeholders]);
    }
  }, [isLoading, page, placeList.length]);

  const lastPlaceElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || isLoading || !places?.data?.results || !isQueryEnabled) {
        return;
      }

      observerRef.current?.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && endPage !== null && page < endPage) {
          setPage((prev) => prev + 1);
        }
      });

      observerRef.current.observe(node);
    },
    [isLoading, places, page, endPage, isQueryEnabled],
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

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
    <motion.div
      key={selectedCategoryId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-6 3xl:grid-cols-6 4xl:grid-cols-6"
    >
      {placeList.map((place: Place, index: number) => {
        const isLastElement = index === placeList.length - 1;
        const isPlaceholder = place.id.startsWith('placeholder-');
        const shouldAttachRef = isLastElement && !isLoading && !isPlaceholder && isQueryEnabled;

        return (
          <motion.div
            key={place.id}
            ref={shouldAttachRef ? lastPlaceElementRef : undefined}
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
  );
}
