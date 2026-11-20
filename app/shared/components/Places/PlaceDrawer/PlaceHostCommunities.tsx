'use client';

import { CommunityLink } from '@/app/shared/components/Communities/CommunityLink';
import { PhotoImage } from '@/app/shared/components/Images';
import { usePlaceCommunities } from '@/app/shared/hooks/usePlaces';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { experiencesLine } from '@/types/placeLinks';

/**
 * Other communities that meet at this place: the published ones that have
 * hosted experiences here, busiest first (DEV-385). The owner has its own
 * section above, with Join. Renders nothing when there are none.
 */
export const PlaceHostCommunities = ({ placeId }: { placeId: string }) => {
  const placeDrawer = usePlaceDrawer();
  const { data: communities = [] } = usePlaceCommunities(placeId);
  const hosts = communities.filter((community) => community.relationship === 'host');

  if (hosts.length === 0) return null;

  return (
    <section aria-label="Communities that meet here" className="space-y-3.5 py-6">
      <h3 className="text-[19px] font-bold tracking-[-0.2px] text-brand-ink">
        Communities that meet here
      </h3>
      <ul className="flex flex-col gap-3">
        {hosts.map((community) => (
          <li key={community.id}>
            <CommunityLink
              community={community}
              drawerOptions={{ onCloseBelow: placeDrawer?.closePlace }}
              className="flex min-w-0 items-center gap-3.5 rounded-xl p-1 hover:bg-surface"
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
                  {experiencesLine(community.experiencesCount)} · {community.membersCount}{' '}
                  {community.membersCount === 1 ? 'member' : 'members'}
                </span>
              </span>
            </CommunityLink>
          </li>
        ))}
      </ul>
    </section>
  );
};
