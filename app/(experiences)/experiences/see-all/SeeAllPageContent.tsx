'use client';

import { useState } from 'react';

import { ListExperiences } from '@/app/shared/components/Experiences/List';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useLocation } from '@/context/LocationContext';
import { Experience } from '@/types/experience';

import { SeeAllEmptyState } from './SeeAllEmptyState';
import { SeeAllLayout } from './SeeAllLayout';
import {
  DEFAULT_CITY,
  SEE_ALL_CONFIG,
  SEE_ALL_PAGE_SIZE,
  type ExperienceSeeAllType,
  type SeeAllContext,
} from './config';

export const SeeAllPageContent = ({
  type,
  city: cityParam,
}: {
  type: ExperienceSeeAllType;
  city?: string;
}) => {
  const { city: locationCity, lat, lng } = useLocation();
  const [page, setPage] = useState(1);

  const section = SEE_ALL_CONFIG[type];
  const context: SeeAllContext = {
    // An explicit ?city= wins so a link into another city reads correctly
    // wherever the viewer happens to be
    city: cityParam || locationCity || DEFAULT_CITY,
    lat,
    lng,
  };

  const { data: response, isLoading } = useExperiences(
    { page, page_size: SEE_ALL_PAGE_SIZE, ...section.query(context) },
    true,
  );

  const experiences: Experience[] = response?.data?.results ?? [];
  // Total from the API, not the number currently rendered
  const count: number | null = response?.data?.count ?? null;
  const isEmpty = !isLoading && page === 1 && experiences.length === 0;

  return (
    <SeeAllLayout title={section.title(context)} subtitle={section.subtitle(context, count)}>
      {isEmpty ? (
        <SeeAllEmptyState message="Nothing here right now" />
      ) : (
        <ListExperiences
          type="discover"
          variant="row"
          experiences={experiences}
          isLoading={isLoading}
          count={count ?? 0}
          page={page}
          setPage={setPage}
          skeletonCount={SEE_ALL_PAGE_SIZE}
          className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        />
      )}
    </SeeAllLayout>
  );
};
