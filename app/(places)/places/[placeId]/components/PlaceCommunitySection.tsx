'use client';

import { CommunityLink } from '@/app/shared/components/Communities/CommunityLink';
import { PhotoImage } from '@/app/shared/components/Images';
import { SectionShell } from '@/app/shared/components/Sections';
import { usePlaceCommunities } from '@/app/shared/hooks/usePlaces';
import { NoData } from '@/components/ui/noData';
import { experiencesLine } from '@/types/placeLinks';

/**
 * The communities linked to a place (DEV-385): the one that owns it, then the
 * ones that have hosted experiences there, busiest first.
 */
export const PlaceCommunitySection = ({ placeId }: { placeId: string }) => {
  const { data: communities = [], isLoading } = usePlaceCommunities(placeId);

  return (
    <SectionShell id="community" title={communities.length > 1 ? 'Communities' : 'Community'}>
      {isLoading ? (
        <div className="h-20 animate-pulse rounded-xl bg-surface" />
      ) : communities.length === 0 ? (
        <div className="py-10">
          <NoData message="No community is linked to this place yet" />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {communities.map((community) => (
            <li key={community.id}>
              <CommunityLink
                community={community}
                className="flex min-w-0 items-center gap-3.5 rounded-xl bg-surface p-3 hover:bg-surface-brand"
              >
                <PhotoImage
                  src={community.photoUrl ?? undefined}
                  alt=""
                  width={56}
                  height={56}
                  sizes="56px"
                  className="h-14 w-14 flex-shrink-0 rounded-xl bg-surface-brand object-cover"
                />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-[15px] font-semibold text-brand-ink">
                    {community.title}
                  </span>
                  <span className="text-[13.5px] text-ink-muted">
                    {community.relationship === 'owner'
                      ? 'Owns this place'
                      : experiencesLine(community.experiencesCount)}
                  </span>
                </span>
              </CommunityLink>
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
};
