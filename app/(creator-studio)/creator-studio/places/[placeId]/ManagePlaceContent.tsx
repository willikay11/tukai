'use client';

import { useSearchParams } from 'next/navigation';

import { BackToExplore } from '@/app/(experiences)/experiences/components/BackToExplore';
import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import { UpcomingExperiencesSection } from '@/app/shared/components/Sections';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { usePlaceManager } from '@/app/shared/hooks/usePlaces';
import { Experience } from '@/types/experience';
import { Place } from '@/types/place';
import { placePath } from '@/utils/detail-paths';

/**
 * Where the community that owns a place manages it.
 *
 * The place page keeps the customer's view; the forms live here, beside the
 * experiences the place already runs. Editing the listing and configuring
 * reservations land in the tabs next.
 */
export const ManagePlaceContent = ({ place }: { place: Place }) => {
  const searchParams = useSearchParams();
  const { isManager, isLoading } = usePlaceManager(place.id);

  // Experiences held at this place — a verified filter on the list endpoint
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
      </div>

      {/* Editing the listing and reservation settings arrive as tabs here.
          `?tab=` already selects one so the links that point at them keep
          working when they land. */}
      {searchParams.get('tab') === 'reservations' && (
        <p className="mt-6 rounded-2xl bg-gray-50 p-4 text-sm text-gray-600">
          Reservation settings are not open yet. Until they are, a place becomes bookable once its
          reservation profile is created.
        </p>
      )}

      <div className="mt-8">
        <UpcomingExperiencesSection
          hostName={place.title}
          experiences={experiences}
          isLoading={isLoadingExperiences}
        />
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
        <IconComponent
          iconName="InformationCircleIcon"
          size={18}
          color="currentColor"
          className="mt-0.5 flex-shrink-0 text-primary"
        />
        <p className="text-sm text-gray-600">
          Editing the listing itself is coming next — for now, changes to a place are made by the
          Tukai team.
        </p>
      </div>
    </PageContainer>
  );
};
