import { BucketList } from '@/types/bucket-list';

/**
 * Which of the canvas's three faces a list card wears.
 *
 * The canvas has one card with three states - a list you own opens, one you are
 * on says so and can be left, and any other public one can be joined. Two
 * separate cards said the same thing twice and neither covered all three.
 */
export type BucketListCardState = 'owned' | 'joined' | 'joinable';

/** The list serializer sends `is_member` as a string, so it is read loosely. */
export const isListMember = (bucketList: BucketList): boolean =>
  Boolean(bucketList.isMember) && bucketList.isMember !== 'false';

export const bucketListCardState = (
  bucketList: BucketList,
  userId?: string | null,
): BucketListCardState => {
  if (userId && bucketList.owner?.id === userId) return 'owned';
  if (isListMember(bucketList)) return 'joined';

  return 'joinable';
};

/** The canvas's own labels. */
export const CARD_STATE_LABEL: Record<BucketListCardState, string> = {
  owned: 'Open list',
  joined: 'Joined',
  joinable: 'Join list',
};

/** "12 saved" - what the canvas puts on a card, as against the detail header. */
export const savedLine = (bucketList: BucketList): string => `${bucketList.itemCount ?? 0} saved`;

/**
 * "8 ideas, 3 members" - the canvas's wording on the list's own page, where
 * both counts belong. A card has no room for it and says "N saved" instead.
 */
export const countLine = (bucketList: BucketList): string => {
  const items = bucketList.itemCount ?? 0;
  const ideas = `${items} ${items === 1 ? 'idea' : 'ideas'}`;
  const members = bucketList.memberCount ?? 0;

  return members > 0 ? `${ideas}, ${members} members` : ideas;
};
