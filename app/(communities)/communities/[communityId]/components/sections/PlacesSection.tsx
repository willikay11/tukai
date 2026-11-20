'use client';

import { PlaceCard } from '@/app/(experiences)/components/PlaceCard';
import { SectionShell } from '@/app/shared/components/Sections';
import { useCommunityPlaces } from '@/app/shared/hooks/usePlaces';
import { NoData } from '@/components/ui/noData';
import { Place } from '@/types/place';

const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-3.5 gap-y-5';

/**
 * The places this community is the verified owner of, from `community=` on
 * the place list (DEV-433). Kept on the page when there are none, since the
 * Places tab above jumps here.
 */
export const PlacesSection = ({
  communityId,
  communityName,
}: {
  communityId: string;
  communityName: string;
}) => {
  const { data: response, isLoading } = useCommunityPlaces(communityId);
  const places: Place[] = response?.data?.results ?? [];

  return (
    <SectionShell
      id="places"
      title="Places"
      subtitle={places.length > 0 ? `These are the places owned by ${communityName}` : undefined}
    >
      {isLoading ? (
        <div className={GRID} aria-label="Loading places">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : places.length > 0 ? (
        <div className={GRID}>
          {places.map((place) => (
            <PlaceCard key={place.id} place={place} className="w-full" />
          ))}
        </div>
      ) : (
        <div className="py-10">
          <NoData message={`${communityName} doesn't own any places on Tukai yet`} />
        </div>
      )}
    </SectionShell>
  );
};
