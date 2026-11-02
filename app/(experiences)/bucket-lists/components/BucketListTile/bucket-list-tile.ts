import { BucketList, BucketListDetail, BucketListMember } from '@/types/bucket-list';
import { linkedUserName } from '@/types/user';

/**
 * What a card says under its title: who made it on Discover and Following,
 * or whether it is public or private on My bucket lists, where the owner is
 * always the reader.
 */
export type BucketListTileMode = 'owner' | 'visibility';

export const visibilityLabel = (bucketList: Pick<BucketList, 'visibility'>) =>
  bucketList.visibility === 'private' ? 'Private' : 'Public';

/** "12 saved" - how many experiences and places are on it. */
export const tileSavedLine = (bucketList: Pick<BucketList, 'itemCount'>) =>
  `${bucketList.itemCount ?? 0} saved`;

/**
 * The card's whole name, read as one: "Slow Sundays, by Otieno Ouma, 6 saved",
 * or "Weekend hikes, Private, 3 saved" on My bucket lists.
 */
export const tileAccessibleName = (bucketList: BucketList, mode: BucketListTileMode) => {
  const middle =
    mode === 'visibility' ? visibilityLabel(bucketList) : `by ${linkedUserName(bucketList.owner)}`;

  return `${bucketList.name}, ${middle}, ${tileSavedLine(bucketList)}`;
};

/**
 * Up to three members' faces and how many more there are beyond them.
 *
 * Members ride on the detail serializer only - the collection a card usually
 * comes from carries the count and no people. With no faces to show, `extra`
 * is the whole count, and the card says it in words instead.
 */
export const tileFaces = (bucketList: BucketList) => {
  const members: BucketListMember[] = (bucketList as BucketListDetail).members ?? [];
  const faces = members
    .filter((member) => member.status === 'accepted' && member.user?.id !== bucketList.owner?.id)
    .slice(0, 3);
  const count = bucketList.memberCount ?? 0;

  return { faces, extra: Math.max(count - faces.length, 0), count };
};
