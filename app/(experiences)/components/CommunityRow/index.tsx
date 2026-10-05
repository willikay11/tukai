'use client';

import { MediaRow } from '@/app/(experiences)/components/MediaRow';
import { AvatarStack } from '@/app/(experiences)/experiences/components/AvatarStack';
import {
  AVATAR_LIMIT,
  ownerFaces,
} from '@/app/(experiences)/experiences/components/AvatarStack/community-faces';
import { IconComponent } from '@/app/shared/components/Icons';
import { Community } from '@/types/community';
import { coverPhotoUrl } from '@/types/photo';
import { communityPath } from '@/utils/detail-paths';

/** As many category icons as fit the line without crowding the faces above. */
const ICON_LIMIT = 4;

/**
 * A community in the "Communities organising things" grid: its photo, its
 * name, who runs it with how many have joined, and what it is about.
 *
 * ⚠️ The faces are the community's OWNERS. The list endpoint returns no
 * membership records at all - only `members_count` and `owners` - so the "+N"
 * beside them is everyone else counted but not described. One request per row
 * would describe them; eight requests to draw eight facepiles would not be
 * worth it.
 */
export const CommunityRow = ({
  community,
  priority = false,
}: {
  community: Community;
  priority?: boolean;
}) => {
  const faces = ownerFaces(community.owners);
  const memberCount = community.membersCount ?? 0;
  const categories = (community.categories ?? []).filter((category) => category.icon);

  return (
    <MediaRow
      href={communityPath(community)}
      photo={coverPhotoUrl(community.photos, 'thumb')}
      title={community.title}
      priority={priority}
    >
      {faces.length > 0 && (
        <AvatarStack
          users={faces}
          max={AVATAR_LIMIT}
          size="sm"
          plainOverflow
          extraCount={Math.max(memberCount - faces.length, 0)}
        />
      )}

      {categories.length > 0 && (
        <span className="flex items-center gap-2 text-ink-muted">
          {categories.slice(0, ICON_LIMIT).map((category) => (
            <IconComponent
              key={category.id}
              iconName={category.icon}
              size={16}
              color="currentColor"
              // The name is the only thing saying what the glyph means
              className="flex-shrink-0"
            />
          ))}
        </span>
      )}
    </MediaRow>
  );
};
