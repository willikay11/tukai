'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { motion } from 'framer-motion';

import SingleExperience from '@/app/components/experiences/Single';
import NoData from '@/components/ui/noData';
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
  setPage: (nextPage: number) => void;
  skeletonCount?: number;
  type: 'discover' | 'invited';
};

const placeholders = (skeletonCount: number): Experience[] => {
  return Array.from({ length: skeletonCount }, (_, index) => ({
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
  }));
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
}: ListExperiencesProps) {
  const { selectedCategoryId } = useSelectedCategory();
  const [experienceList, setExperienceList] = useState<Experience[]>(placeholders(skeletonCount));
  const [endPage, setEndPage] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);

  const lastExperienceElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || !experiences) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && endPage !== null && page < endPage) {
          setTimeout(() => {
            setPage(page + 1);
          }, 500);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, experiences, page, endPage],
  );

  useEffect(() => {
    setPage(1);
    setExperienceList(placeholders(skeletonCount));
    setEndPage(null);
  }, [selectedCategoryId]);

  useEffect(() => {
    console.log('Experiences updated:', experiences);
    if (!isLoading && experiences && experiences.length > 0) {
      if (page === 1) {
        // Replace entire list for first page
        setExperienceList(experiences);
      } else {
        // Append to existing list for pagination
        setExperienceList((prevExperienceList) => [
          ...prevExperienceList.filter((experience) => !experience.id.startsWith('placeholder-')),
          ...experiences,
        ]);
      }
      if (count) {
        setEndPage(Math.ceil(count / 12));
      }
    } else if (!isLoading && experiences && experiences.length === 0 && page === 1) {
      // Clear placeholders when no results for first page
      setExperienceList([]);
    } else if (
      isLoading &&
      page > 1 &&
      !experienceList.some((experience) => experience.id.startsWith('placeholder-'))
    ) {
      // Add placeholders only when loading subsequent pages
      setExperienceList((prevExperienceList) => [
        ...prevExperienceList,
        ...placeholders(skeletonCount),
      ]);
    }
  }, [experiences, isLoading, page]);

  if (!isLoading && experienceList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <NoData message="No experiences found" />
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        key={selectedCategoryId}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={className}
      >
        {experienceList.map((experience: Experience, index: number) => {
          const isLastElement = index === experienceList.length - 1;
          return (
            <motion.div
              key={experience.id}
              ref={isLastElement ? lastExperienceElementRef : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="cursor-pointer"
            >
              <Link target="_blank" href={`/experiences/${experience.id}`}>
                <SingleExperience type={type} experience={experience} />
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}
