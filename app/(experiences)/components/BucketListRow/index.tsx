'use client';

import { MediaRow } from '@/app/(experiences)/components/MediaRow';
import { AvatarStack } from '@/app/(experiences)/experiences/components/AvatarStack';
import { savedLine } from '@/app/(experiences)/experiences/components/BucketListCard/bucket-list-card';
import { IconComponent } from '@/app/shared/components/Icons';
import { BucketList, bucketListCoverPhoto } from '@/types/bucket-list';
import { linkedUserName } from '@/types/user';
import { CANVAS_ICONS } from '@/utils/canvas-icons';

/**
 * A public list in the Discover grid: its cover, its name, who made it, who is
 * on it and how much is in it.
 *
 * ⚠️ Only one face. The list endpoint carries `member_count` but no membership
 * records — the detail endpoint is the only place those live — so the pile is
 * the owner, and the "+N" is everyone else counted but not described.
 */
export const BucketListRow = ({
  bucketList,
  priority = false,
}: {
  bucketList: BucketList;
  priority?: boolean;
}) => {
  const owner = bucketList.owner;
  const ownerName = owner ? linkedUserName(owner) : '';
  const faces = owner ? [{ id: owner.id, name: ownerName, picture: owner.picture }] : [];

  return (
    <MediaRow
      href={`/bucket-lists/${bucketList.id}`}
      photo={bucketListCoverPhoto(bucketList)}
      title={bucketList.name}
      priority={priority}
    >
      {ownerName && (
        <span className="truncate text-sm text-ink-muted">
          By <span className="font-semibold text-brand-ink">{ownerName}</span>
        </span>
      )}

      <span className="flex items-center gap-2">
        {faces.length > 0 && (
          <AvatarStack
            users={faces}
            max={1}
            size="sm"
            plainOverflow
            extraCount={Math.max((bucketList.memberCount ?? 0) - faces.length, 0)}
          />
        )}

        {faces.length > 0 && <span className="text-ink-subtle">·</span>}

        <span className="flex items-center gap-1.5 text-13 text-ink-muted">
          <IconComponent
            iconName={CANVAS_ICONS.basket}
            size={16}
            color="currentColor"
            className="flex-shrink-0"
          />
          {savedLine(bucketList)}
        </span>
      </span>
    </MediaRow>
  );
};
