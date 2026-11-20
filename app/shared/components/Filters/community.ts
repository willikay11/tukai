import { Experience } from '@/types/experience';

/** How many of the reader's joined communities "Your communities" reads - one page. */
export const YOUR_COMMUNITIES_PAGE = 50;

/**
 * Hosted by a community in `followedIds`.
 *
 * The API's `community` param takes one id, not a list, so this narrows the
 * rows that come back rather than the request - the same reason
 * `matchesShapes` exists. `followedIds` are the communities the reader has
 * joined (`joined=true`, DEV-436), pending invites and requests left out.
 */
export const matchesYourCommunities = (
  experience: Experience,
  yourCommunitiesOnly: boolean,
  followedIds: string[],
): boolean => {
  if (!yourCommunitiesOnly) return true;

  const hostCommunityId = experience.hostCommunity?.id;
  return Boolean(hostCommunityId && followedIds.includes(hostCommunityId));
};
