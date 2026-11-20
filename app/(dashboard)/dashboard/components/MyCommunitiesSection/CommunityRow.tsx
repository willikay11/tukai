import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Community } from '@/types/community';
import { Photo } from '@/types/photo';
import { communityPath } from '@/utils/detail-paths';

/**
 * The handoff's "You run this, {n} past experiences hosted", from
 * `past_experiences_count` (DEV-414). The member count stands in only when a
 * response does not carry it.
 */
export const CommunityRow = ({
  community,
  isOwned,
}: {
  community: Community;
  isOwned: boolean;
}) => {
  const cover =
    community.photos?.find((photo: Photo) => photo.isCover)?.photo || community.photos?.[0]?.photo;
  const members = community.membersCount ?? 0;
  const past = community.pastExperiencesCount;
  const tally =
    past !== undefined
      ? `${past} past ${past === 1 ? 'experience' : 'experiences'} hosted`
      : `${members} ${members === 1 ? 'member' : 'members'}`;
  const line = `${isOwned ? 'You run this, ' : ''}${tally}`;

  return (
    <Link
      href={communityPath(community)}
      className="flex min-h-[80px] min-w-0 items-center gap-3.5 rounded-xl p-2 hover:bg-surface"
    >
      <span className="relative block h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
        <PhotoImage src={cover} alt="" fill sizes="64px" className="object-cover" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-base font-semibold leading-[1.3] text-gray-900">
            {community.title}
          </span>
          {community.verified && (
            <span role="img" aria-label="Verified business" className="flex-shrink-0">
              <IconComponent
                iconName="Briefcase01Icon"
                size={19}
                color="currentColor"
                className="text-brand"
              />
            </span>
          )}
          <IconComponent
            iconName="ArrowUpRight01Icon"
            size={20}
            color="currentColor"
            className="flex-shrink-0 text-brand"
          />
        </span>
        <span className="text-[14.5px] text-ink-muted">{line}</span>
      </span>
    </Link>
  );
};
