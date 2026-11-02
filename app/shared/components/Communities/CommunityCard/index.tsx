'use client';

import {
  AvatarStack,
  type AvatarStackUser,
} from '@/app/(experiences)/experiences/components/AvatarStack';
import {
  AVATAR_LIMIT,
  ownerFaces,
} from '@/app/(experiences)/experiences/components/AvatarStack/community-faces';
import { CommunityLink } from '@/app/shared/components/Communities/CommunityLink';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useCommunityDetail } from '@/app/shared/hooks/useCommunities';
import { Community, CommunityMember, CommunityOwner } from '@/types/community';
import { photoUrl } from '@/types/photo';

import { communityCardAriaLabel } from './community-card';

const MAX_INTERESTS = 4;

/**
 * The compact community card from the Communities handoff: a 62px photo, the
 * name, and - depending on which section places it - a row of member faces,
 * a row of interest icons and an upcoming-experience count, or both.
 *
 * Not a replacement for `CommunityDiscoverCard` (the 320px cover-photo card
 * used on the Experiences page's category rows): that card is out of this
 * handoff's scope and stays as it is. This one is only for the Communities
 * page's own Discover / Following / My communities grids.
 */
export const CommunityCard = ({
  community,
  showFaces = true,
  showMeta = true,
  showMemberAvatars = false,
  className,
}: {
  community: Community;
  /** View by type: faces only. */
  showFaces?: boolean;
  /** Following / Created or hosted by you / All communities: both faces and meta. */
  showMeta?: boolean;
  /** Fetches the community's members so the faces are real members rather
   * than just its owners - the list endpoint returns none. One request per
   * card, so it is opt-in: only the reader's own, smaller grids turn it on. */
  showMemberAvatars?: boolean;
  className?: string;
}) => {
  const photo = photoUrl(community.photos?.[0], 'thumb');
  const memberCount = community.membersCount ?? community.members?.length ?? 0;

  const listMembers: CommunityMember[] = community.members ?? [];
  const { data: detail } = useCommunityDetail(
    community.id,
    showMemberAvatars && showFaces && listMembers.length === 0,
  );
  const members: CommunityMember[] = listMembers.length
    ? listMembers
    : (detail?.data?.members ?? []);
  const owners: CommunityOwner[] = community.owners ?? [];
  const faces: AvatarStackUser[] = members.length
    ? members.slice(0, AVATAR_LIMIT).map((member) => ({
        id: member.id,
        name:
          member.user?.displayName ||
          `${member.user?.firstName ?? ''} ${member.user?.lastName ?? ''}`.trim(),
        picture: member.user?.picture || null,
      }))
    : ownerFaces(owners);

  const interests = (community.categories ?? []).slice(0, MAX_INTERESTS);

  const ariaLabel = communityCardAriaLabel(community, { memberCount });

  return (
    <CommunityLink
      community={community}
      ariaLabel={ariaLabel}
      className={className ?? 'flex w-full min-w-0 items-start gap-2.5 text-left'}
    >
      <div className="relative h-[62px] w-[62px] flex-shrink-0 overflow-hidden rounded-xl bg-surface">
        <PhotoImage src={photo} alt="" fill sizes="62px" className="object-cover" />

        {!community.isPublic && (
          <span className="absolute bottom-[5px] left-[5px] flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-lime">
            <IconComponent
              iconName="SquareLock02Icon"
              size={13}
              color="currentColor"
              className="text-brand-ink"
            />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-sm font-semibold leading-[1.3] text-brand-ink [text-wrap:pretty]">
          {community.title}
          {community.verified && (
            <span
              role="img"
              aria-label="Verified business"
              className="ml-1 inline-block translate-y-[-2px]"
            >
              <IconComponent
                iconName="Briefcase01Icon"
                size={15}
                color="currentColor"
                className="text-ink-subtle"
              />
            </span>
          )}
        </p>

        {showFaces && faces.length > 0 && (
          <div className="flex min-w-0 items-center gap-2">
            <AvatarStack
              users={faces}
              max={AVATAR_LIMIT}
              size="sm"
              plainOverflow
              extraCount={Math.max(memberCount - faces.length, 0)}
            />
          </div>
        )}

        {showMeta && interests.length > 0 && (
          <div className="flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden">
            {interests.map((interest) => (
              <IconComponent
                key={interest.id}
                iconName={interest.icon}
                size={15}
                color="currentColor"
                className="flex-shrink-0 text-ink-muted"
              />
            ))}
          </div>
        )}
      </div>
    </CommunityLink>
  );
};
