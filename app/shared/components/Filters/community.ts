import { Experience } from '@/types/experience';

/**
 * Hosted by a community in `followedIds`.
 *
 * The API's `community` param takes one id, not a list, so this narrows the
 * rows that come back rather than the request - the same reason
 * `matchesShapes` exists. `followedIds` is "communities the reader follows",
 * the closest the API offers to "communities the reader joined": there is no
 * membership-scoped endpoint.
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
