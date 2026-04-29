'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import { motion } from 'framer-motion';

import SingleExperience from '@/app/components/experiences/Single';
import { NoData } from '@/components/ui/noData';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { Status } from '@/enums/status';
import { Experience } from '@/types/experience';

type ListExperiencesProps = {
  className: string;
  isLoading: boolean;
  count: number;
  experiences: Experience[];
  invitedExperiences?: Experience[];
  page: number;
  setPage: (page: number) => void;
  skeletonCount?: number;
  type: 'discover' | 'invited';
  noDataMessage?: string;
};

const createPlaceholders = (count: number): Experience[] => {
  return Array.from({ length: count }, (_, index) => ({
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
    dateCreated: '',
    startDate: '',
    endDate: '',
    currency: '',
    priceStartsFrom: { amount: 0, currency: '' },
    ticketsAvailable: false,
    isSoldOut: false,
    isPublic: false,
    isBookmarked: false,
    status: 'DRAFT' as Status,
    photos: [],
    totalReviews: 0,
    averageRating: 0,
    categories: [],
    tickets: [],
    host: {
      id: '',
      firstName: '',
      lastName: '',
      displayName: '',
      picture: '',
    },
    coHosts: [],
  })) as unknown as Experience[];
};

export default function ListExperiences({
  type,
  experiences,
  isLoading,
  count,
  className,
  skeletonCount = 12,
  page,
  setPage,
  noDataMessage,
}: ListExperiencesProps) {
  const { selectedCategoryId } = useSelectedCategory();

  const initialPlaceholders = useMemo(() => createPlaceholders(skeletonCount), [skeletonCount]);
  const [experienceList, setExperienceList] = useState<Experience[]>(initialPlaceholders);
  const [endPage, setEndPage] = useState<number | null>(null);

  const prevPageRef = useRef(page);
  const hasAddedPlaceholdersRef = useRef<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Calculate end page when count changes
  useEffect(() => {
    if (count > 0) {
      setEndPage(Math.ceil(count / skeletonCount));
    }
  }, [count, skeletonCount]);

  // Reset on category change
  useEffect(() => {
    setPage(1);
    setExperienceList(initialPlaceholders);
    setEndPage(null);
    hasAddedPlaceholdersRef.current.clear();
    prevPageRef.current = 1;
  }, [selectedCategoryId, setPage, initialPlaceholders]);

  // Handle experience updates
  useEffect(() => {
    const isFirstPage = page === 1;
    const hasExperiences = experiences && experiences.length > 0;
    const isEmpty = experiences && experiences.length === 0;

    if (isLoading) {
      // Only add placeholders for subsequent pages if not already added
      if (page > 1 && prevPageRef.current !== page && !hasAddedPlaceholdersRef.current.has(page)) {
        hasAddedPlaceholdersRef.current.add(page);
        setExperienceList((prev) => [
          ...prev.filter((exp) => !exp.id.startsWith('placeholder-')),
          ...createPlaceholders(skeletonCount),
        ]);
      }
    } else {
      if (hasExperiences) {
        if (isFirstPage) {
          setExperienceList(experiences);
          hasAddedPlaceholdersRef.current.clear();
        } else if (prevPageRef.current !== page) {
          // Only append if this is a new page
          setExperienceList((prev) => [
            ...prev.filter((exp) => !exp.id.startsWith('placeholder-')),
            ...experiences,
          ]);
        }
      } else if (isEmpty && isFirstPage) {
        setExperienceList([]);
        hasAddedPlaceholdersRef.current.clear();
      }
    }

    prevPageRef.current = page;
  }, [experiences, isLoading, page, skeletonCount]);

  // Intersection observer for infinite scroll
  const lastExperienceElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Cleanup previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      // Don't observe while loading or if no more pages
      if (isLoading || !node || endPage === null || page >= endPage) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setPage(page + 1);
          }
        },
        { threshold: 0.1, rootMargin: '100px' },
      );

      observerRef.current.observe(node);
    },
    [isLoading, page, endPage, setPage],
  );

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Show no data message
  if (!isLoading && experienceList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <NoData message={noDataMessage || 'No experiences found'} />
      </motion.div>
    );
  }

  return (
    <motion.div
      key={selectedCategoryId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {experienceList.map((experience: Experience, index: number) => {
        const isLastElement = index === experienceList.length - 1;
        const isPlaceholder = experience.id.startsWith('placeholder-');

        return (
          <motion.div
            key={experience.id}
            ref={isLastElement && !isPlaceholder ? lastExperienceElementRef : undefined}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            className="cursor-pointer"
          >
            <Link target="_blank" href={`/experiences/${experience.id}`}>
              <SingleExperience type={type} experience={experience} />
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
