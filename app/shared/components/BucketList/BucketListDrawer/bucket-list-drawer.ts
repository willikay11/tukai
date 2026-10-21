import { BucketListDetail } from '@/types/bucket-list';

export type BucketListDrawerView = 'list' | 'members';

/** Why the detail fetch failed, as the side panel needs to tell it apart. */
export type BucketListUnavailableReason = 'locked' | 'gone';

/**
 * A 404 means the list is gone; anything else (403 while signed in, or no
 * session at all against a private list) reads as "you do not have access" -
 * the two faces the canvas draws for an unopenable list.
 */
export const bucketListUnavailableReason = (status?: number): BucketListUnavailableReason =>
  status === 404 ? 'gone' : 'locked';

export const BUCKET_LIST_UNAVAILABLE_COPY: Record<
  BucketListUnavailableReason,
  { title: string; line: string }
> = {
  locked: {
    title: 'This bucket list is private',
    line: 'Only people the owner invites can open it. A forwarded link grants nothing.',
  },
  gone: {
    title: 'This bucket list is no longer available',
    line: 'The owner deleted it. The experiences and places on it are still on Tukai.',
  },
};

export type BucketListConfirmKind = 'delete' | 'leave';

export interface BucketListConfirmCopy {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
}

/** The delete and leave confirm dialogs' copy, each keyed to the list itself. */
export const bucketListConfirmCopy = (
  kind: BucketListConfirmKind,
  bucketList: BucketListDetail,
): BucketListConfirmCopy => {
  if (kind === 'delete') {
    return {
      title: `Delete "${bucketList.name}"?`,
      body: 'This removes the list for you and everyone on it. The experiences and places themselves stay on Tukai. You can’t undo this.',
      confirmLabel: 'Delete bucket list',
      cancelLabel: 'Keep bucket list',
    };
  }

  const isPublic = bucketList.visibility === 'public';

  return {
    title: `Leave "${bucketList.name}"?`,
    body: isPublic
      ? 'It moves out of Following. The list stays public, so you can join again any time.'
      : 'You lose access straight away. Only the owner can invite you back.',
    confirmLabel: 'Leave bucket list',
    cancelLabel: 'Stay',
  };
};

/** Who is allowed to put something new on the list - the owner, and a
 * private list's own members. A public list's members browse it, same as
 * anyone else, but do not add to it. */
export const canAddToBucketList = (isOwner: boolean, isMember: boolean, isPublic: boolean) =>
  isOwner || (isMember && !isPublic);
