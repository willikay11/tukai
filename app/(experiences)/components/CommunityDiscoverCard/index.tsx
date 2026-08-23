'use client';

import Link from 'next/link';

import { AvatarStack } from '@/app/(experiences)/experiences/components/AvatarStack';
import { PhotoImage } from '@/app/shared/components/Images';
import { useCommunityDetail } from '@/app/shared/hooks/useCommunities';
import { cn } from '@/lib/utils';
import { BucketListMember } from '@/types/bucket-list';
import { Community, CommunityMember, CommunityOwner } from '@/types/community';
import { Photo } from '@/types/photo';
import { toPlainText } from '@/utils/safe-text-utils';

const AVATAR_LIMIT = 3;

export const CommunityDiscoverCard = ({
  community,
  className,
  showMemberAvatars = false,
}: {
  community: Community;
  // Defaults to the fixed width the Discover row needs; grids pass w-full
  className?: string;
  // Fetches the community's members so the facepile shows real member faces
  // rather than just its owner. Costs one request per card, so it is opt-in:
  // the Discover row leaves it off, the communities grid turns it on.
  showMemberAvatars?: boolean;
}) => {
  const coverPhoto =
    community.photos?.find((photo: Photo) => photo.isCover)?.photo || community.photos?.[0]?.photo;

  const category = community.categories?.[0]?.name;

  // ⚠️ The list endpoint returns NO membership records — only `members_count`
  // and `owners`. So the faces shown are the community's OWNERS, and the "+N"
  // is everyone else counted but not described. The detail endpoint does return
  // `members`, so prefer those when they are present.
  const listMembers: CommunityMember[] = community.members ?? [];
  const owners: CommunityOwner[] = community.owners ?? [];

  // Only worth asking when the caller wants faces and the row it was given has
  // none — the detail endpoint is the only source of membership records
  const { data: detail } = useCommunityDetail(
    community.id,
    showMemberAvatars && listMembers.length === 0,
  );
  const members: CommunityMember[] = listMembers.length
    ? listMembers
    : (detail?.data?.members ?? []);

  const avatarUsers: BucketListMember[] = members.length
    ? members.slice(0, AVATAR_LIMIT).map((member) => ({
        id: member.id,
        name:
          member.user?.displayName ||
          `${member.user?.firstName ?? ''} ${member.user?.lastName ?? ''}`.trim(),
        picture: member.user?.picture || null,
      }))
    : owners.slice(0, AVATAR_LIMIT).map((owner) => ({
        id: owner.id,
        name: owner.displayName || `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim(),
        picture: owner.picture || null,
      }));

  const totalMembers = community.membersCount ?? members.length;

  return (
    <Link
      href={`/communities/${community.id}`}
      className={cn('w-[320px] flex-shrink-0 snap-start', className)}
    >
      <div className="relative h-[180px] w-full overflow-hidden rounded-2xl">
        <PhotoImage
          src={coverPhoto}
          alt={community.title}
          fill
          sizes="320px"
          className="object-cover"
        />

        {/* Same translucent treatment as the bookmark circle over an experience
            photo, rather than a solid brand fill */}
        {category && (
          <span className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {category}
          </span>
        )}
      </div>

      <div className="pt-3">
        <p className="text-base font-bold text-gray-900">{community.title}</p>
        {/* Descriptions come back as HTML; this card shows a text excerpt */}
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {toPlainText(community.description)}
        </p>

        {avatarUsers.length > 0 && (
          <div className="mt-3">
            <AvatarStack
              users={avatarUsers}
              max={AVATAR_LIMIT}
              extraCount={Math.max(totalMembers - avatarUsers.length, 0)}
            />
          </div>
        )}
      </div>
    </Link>
  );
};
