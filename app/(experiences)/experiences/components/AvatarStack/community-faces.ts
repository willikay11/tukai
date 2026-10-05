import { CommunityOwner } from '@/types/community';

import { AvatarStackUser } from './index';

/** The faces a stack shows for a community, and how many it does not. */
export const AVATAR_LIMIT = 3;

/**
 * Owner records as faces.
 *
 * ⚠️ The communities LIST endpoint returns no membership records - only
 * `members_count` and `owners` - so a row built from it can only ever show the
 * people who run the community. The detail endpoint does return `members`,
 * which is why CommunityDiscoverCard prefers those when it has them.
 */
export const ownerFaces = (
  owners: CommunityOwner[] = [],
  limit: number = AVATAR_LIMIT,
): AvatarStackUser[] =>
  owners.slice(0, limit).map((owner) => ({
    id: owner.id,
    name: owner.displayName || `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim(),
    picture: owner.picture || null,
  }));
