'use client';

import { PlaceCard } from '@/app/(experiences)/components/PlaceCard';
import { placesToShow } from '@/app/shared/components/Communities/CommunityDrawer/community-drawer';
import { SectionShell } from '@/app/shared/components/Sections';
import { useCommunityPlaces } from '@/app/shared/hooks/useCommunities';
import { NoData } from '@/components/ui/noData';
import { CommunityPlace } from '@/types/community';
import { Place } from '@/types/place';

const GRID = 'grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-3.5 gap-y-5';

/**
 * The places this community owns, or - when it owns none - the ones it has
 * hosted experiences at, from GET /communities/{id}/places/ (DEV-382). Kept on
 * the page when there are none, since the Places tab above jumps here.
 */
export const PlacesSection = ({
  communityId,
  communityName,
}: {
  communityId: string;
  communityName: string;
}) => {
  const { data: response, isLoading } = useCommunityPlaces(communityId);
  const all: CommunityPlace[] = response?.success ? (response.data?.results ?? []) : [];
  const { places, isOwned } = placesToShow(all);

  const subtitle =
    places.length === 0
      ? undefined
      : isOwned
        ? `These are the places owned by ${communityName}`
        : `Places ${communityName} meets at`;

  return (
    <SectionShell id="places" title="Places" subtitle={subtitle}>
      {isLoading ? (
        <div className={GRID} aria-label="Loading places">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : places.length > 0 ? (
        <div className={GRID}>
          {places.map((place) => (
            // A place summary, not the full record; the card reads only what it has
            <PlaceCard key={place.id} place={place as unknown as Place} className="w-full" />
          ))}
        </div>
      ) : (
        <div className="py-10">
          <NoData message={`${communityName} has no places on Tukai yet`} />
        </div>
      )}
    </SectionShell>
  );
};
