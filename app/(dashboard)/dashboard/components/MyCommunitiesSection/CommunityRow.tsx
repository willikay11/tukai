import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Community } from '@/types/community';
import { Photo } from '@/types/photo';
import { communityPath } from '@/utils/detail-paths';

/**
 * ⚠️ The handoff's "{n} past experiences hosted" line has no backing count
 * anywhere in the API (its own prototype generates that number from a hash of
 * the community id - explicitly sample data, not logic to port). This shows
 * the community's real member count instead - see the Dashboard backend-gaps
 * note.
 */
export const CommunityRow = ({ community, isOwned }: { community: Community; isOwned: boolean }) => {
  const cover =
    community.photos?.find((photo: Photo) => photo.isCover)?.photo || community.photos?.[0]?.photo;
  const members = community.membersCount ?? 0;
  const line = `${isOwned ? 'You run this · ' : ''}${members} ${members === 1 ? 'member' : 'members'}`;

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
              <IconComponent iconName="Briefcase01Icon" size={19} color="currentColor" className="text-brand" />
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
