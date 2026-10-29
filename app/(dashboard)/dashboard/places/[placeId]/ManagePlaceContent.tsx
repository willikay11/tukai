'use client';

import { useEffect } from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { BackToExplore } from '@/app/(experiences)/experiences/components/BackToExplore';
import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import { UpcomingExperiencesSection } from '@/app/shared/components/Sections';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { usePlaceManager } from '@/app/shared/hooks/usePlaces';
import { Button } from '@/components/ui/button';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { Experience } from '@/types/experience';
import { Place } from '@/types/place';
import { placePath } from '@/utils/detail-paths';

/**
 * Where the community that owns a place manages it.
 *
 * The place page keeps the customer's view; editing the listing lives here,
 * beside the experiences the place already runs. Reservation settings used
 * to be its own page at this route's `/reservations` child, then a `?tab=`
 * on this one - both now stack the same drawer every other entry point
 * opens, so a link still carrying either opens it automatically.
 */
export const ManagePlaceContent = ({ place }: { place: Place }) => {
  const searchParams = useSearchParams();
  const drawer = usePlaceDrawer();
  const { isManager, isLoading } = usePlaceManager(place.id);

  useEffect(() => {
    if (searchParams.get('tab') === 'reservations') {
      drawer?.openPlace(place.id, { view: 'reservations' });
    }
    // Only when the page first carries the legacy param, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place.id, searchParams]);

  // Experiences held at this place - a verified filter on the list endpoint
  const { data: experiencesResponse, isLoading: isLoadingExperiences } = useExperiences(
    { page: 1, page_size: 12, place: place.id },
    true,
  );
  const experiences: Experience[] = experiencesResponse?.data?.results ?? [];

  if (isLoading) {
    return (
      <PageContainer variant="detail" className="py-6">
        <div className="h-64 animate-pulse rounded-3xl bg-gray-100" />
      </PageContainer>
    );
  }

  // Ownership is the whole basis of this page, so it says so rather than
  // rendering an empty console
  if (!isManager) {
    return (
      <PageContainer variant="detail" className="py-16 text-center">
        <p className="text-sm text-gray-500">
          Only the community that owns {place.title} can manage it.
        </p>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="detail" className="py-6">
      <BackToExplore href={placePath(place)} label={`Back to ${place.title}`} />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage {place.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your listing, the experiences you run here, and how you take reservations.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="gradient-outline" className="rounded-full">
            <Link href={`/dashboard/places/${place.id}/edit`}>
              <span className="flex items-center gap-2">
                <IconComponent iconName="Edit02Icon" color="currentColor" size={16} />
                Edit place
              </span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="gradient-outline"
            className="rounded-full"
            onClick={() => drawer?.openPlace(place.id, { view: 'reservations' })}
          >
            <span className="flex items-center gap-2">
              <IconComponent iconName="Calendar03Icon" color="currentColor" size={16} />
              Reservation settings
            </span>
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <UpcomingExperiencesSection
          hostName={place.title}
          experiences={experiences}
          isLoading={isLoadingExperiences}
        />
      </div>
    </PageContainer>
  );
};
