'use client';

import Link from 'next/link';

import { AvatarStack } from '@/app/(experiences)/experiences/components/AvatarStack';
import { PhotoImage } from '@/app/shared/components/Images';
import { BucketListMember } from '@/types/bucket-list';
import { Community, CommunityMember } from '@/types/community';
import { Photo } from '@/types/photo';
import { toPlainText } from '@/utils/safe-text-utils';

const AVATAR_LIMIT = 3;

export const CommunityDiscoverCard = ({ community }: { community: Community }) => {
  const coverPhoto =
    community.photos?.find((photo: Photo) => photo.isCover)?.photo || community.photos?.[0]?.photo;

  const category = community.categories?.[0]?.name;

  // ⚠️ Community has no membersCount field, so the total is only as complete as
  // the members array the list endpoint returns. AvatarStack derives the "+N"
  // from that same array rather than a separate count we do not have.
  const members: CommunityMember[] = community.members ?? [];
  const avatarUsers: BucketListMember[] = members.slice(0, AVATAR_LIMIT).map((member) => ({
    id: member.id,
    name:
      member.user?.displayName ||
      `${member.user?.firstName ?? ''} ${member.user?.lastName ?? ''}`.trim(),
    picture: member.user?.picture || null,
  }));

  return (
    <Link href={`/communities/${community.id}`} className="w-[320px] flex-shrink-0 snap-start">
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
              extraCount={Math.max(members.length - avatarUsers.length, 0)}
            />
          </div>
        )}
      </div>
    </Link>
  );
};
