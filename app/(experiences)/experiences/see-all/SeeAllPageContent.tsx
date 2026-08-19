'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { BackToExplore } from '@/app/(experiences)/experiences/components/BackToExplore';
import { Breadcrumb } from '@/app/shared/components/Breadcrumb';
import { ListExperiences } from '@/app/shared/components/Experiences/List';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { useLocation } from '@/context/LocationContext';
import { Experience } from '@/types/experience';

import {
  DEFAULT_CITY,
  SEE_ALL_CONFIG,
  SEE_ALL_PAGE_SIZE,
  type SeeAllContext,
  type SeeAllType,
} from './config';

export const SeeAllPageContent = ({
  type,
  city: cityParam,
}: {
  type: SeeAllType;
  city?: string;
}) => {
  const router = useRouter();
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

  const title = section.title(context);
  const subtitle = section.subtitle(context, count);
  const isEmpty = !isLoading && page === 1 && experiences.length === 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <Breadcrumb
        variant="accent"
        items={[{ label: 'Discover', href: '/experiences' }, { label: title }]}
      />

      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-gray-400">{subtitle}</p>}
        </div>
        <BackToExplore label="Back" variant="pill" />
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <NoData message="Nothing here right now" />
          <Button onClick={() => router.push('/experiences')} className="rounded-full px-6">
            Back to Discover
          </Button>
        </div>
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
    </main>
  );
};
