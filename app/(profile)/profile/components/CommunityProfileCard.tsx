'use client';

import Link from 'next/link';

import {
  AvatarStack,
  type AvatarStackUser,
} from '@/app/(experiences)/experiences/components/AvatarStack';
import { ownerFaces } from '@/app/(experiences)/experiences/components/AvatarStack/community-faces';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Community } from '@/types/community';
import { coverPhotoUrl } from '@/types/photo';
import { communityPath } from '@/utils/detail-paths';

export const CommunityProfileCard = ({ community }: { community: Community }) => {
  const avatars: AvatarStackUser[] = ownerFaces(community.owners ?? []);
  const extraCount = Math.max((community.membersCount ?? 0) - avatars.length, 0);
  const categories = community.categories.slice(0, 4);

  return (
    <Link href={communityPath(community)} className="flex min-w-0 items-start gap-2.5 text-left">
      <span className="relative block h-[62px] w-[62px] flex-shrink-0 overflow-hidden rounded-xl bg-surface">
        <PhotoImage
          src={coverPhotoUrl(community.photos, 'md')}
          alt={community.title}
          fill
          sizes="62px"
          className="object-cover"
        />

        {!community.isPublic && (
          <span className="absolute bottom-[5px] left-[5px] flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-lime text-brand-ink">
            <IconComponent iconName="SquareLock02Icon" size={13} color="currentColor" />
          </span>
        )}
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="text-sm font-semibold leading-[1.3] text-brand-ink">
          {community.title}
          {community.verified && (
            <span
              role="img"
              aria-label="Verified business"
              className="ml-1 inline-block flex-shrink-0 align-[-2px] text-ink-subtle"
            >
              <IconComponent iconName="Briefcase01Icon" size={15} color="currentColor" />
            </span>
          )}
        </span>

        {avatars.length > 0 && (
          <div className="flex items-center gap-2">
            <AvatarStack users={avatars} max={3} size="sm" plainOverflow extraCount={extraCount} />
          </div>
        )}

        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-hidden">
            {categories.map((category) => (
              <IconComponent
                key={category.id}
                iconName={category.icon}
                size={15}
                color="currentColor"
                className="flex-shrink-0 text-ink-muted"
                aria-label={category.name}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};
