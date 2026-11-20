import { Community } from '@/types/community';

/**
 * The card's accessible name, built from sentence fragments - each ending in
 * a full stop, per the Communities handoff ("Nairobi Foodies Club. Amina,
 * Njeri joined. 1,240 members. Restaurants, Nyama Choma (Braai), Date spots.
 * 2 upcoming experiences."). `friendNames` is given on "Your friends joined"
 * only; `upcomingCount` from `upcoming_experiences_count` when above zero.
 */
export const communityCardAriaLabel = (
  community: Community,
  {
    friendNames,
    memberCount,
    upcomingCount,
  }: { friendNames?: string[]; memberCount: number; upcomingCount?: number },
): string => {
  const parts: string[] = [`${community.title}.`];

  if (!community.isPublic) parts.push('Private community.');
  if (community.verified) parts.push('Verified business.');
  if (friendNames && friendNames.length > 0) parts.push(`${friendNames.join(', ')} joined.`);

  parts.push(`${memberCount} members.`);

  const interestNames = community.categories?.map((category) => category.name) ?? [];
  if (interestNames.length > 0) parts.push(`${interestNames.join(', ')}.`);

  if (upcomingCount !== undefined) {
    parts.push(`${upcomingCount} upcoming ${upcomingCount === 1 ? 'experience' : 'experiences'}.`);
  }

  return parts.join(' ');
};
