import { BucketListDetail, BucketListMember } from '@/types/bucket-list';
import { LinkedUser, linkedUserName } from '@/types/user';

/**
 * One screen in the bucket list panel. The panel is a stack: a list at the
 * bottom, with Members, Invite members or Edit opened on top of it and Back
 * taking them off again. Create stands alone, and is replaced by Created once
 * the list exists.
 */
export type BucketListScreen =
  | { kind: 'list'; id: string }
  | { kind: 'members'; id: string }
  | { kind: 'invite'; id: string }
  | { kind: 'edit'; id: string }
  | { kind: 'create' }
  | { kind: 'created'; id: string; name: string; visibility: 'public' | 'private' };

/** How a screen moves the panel. Every screen is handed the same set. */
export interface BucketListNav {
  /** Opens a screen on top, with Back. */
  push: (screen: BucketListScreen) => void;
  /** Swaps the top screen for another, as Created does for its list. */
  replace: (screen: BucketListScreen) => void;
  /** Takes the top screen off, or closes the panel when nothing is below. */
  back: () => void;
  /** Takes a list and everything on top of it off - after delete or leave. */
  closeList: (bucketListId: string) => void;
  close: () => void;
  /** Whether there is a screen under this one, so Back has somewhere to go. */
  canGoBack: boolean;
}

/**
 * The stack once a list is gone: the first screen about it comes off, and so
 * does everything above it. Anything below - a list it was opened over - stays.
 */
export const withoutList = (stack: BucketListScreen[], bucketListId: string) => {
  const index = stack.findIndex((screen) => 'id' in screen && screen.id === bucketListId);

  return index < 0 ? stack : stack.slice(0, index);
};

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

export type BucketListConfirmKind = 'delete' | 'leave' | 'remove' | 'cancel-invite';

export interface BucketListConfirmCopy {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
}

/**
 * The confirm dialog's copy, each keyed to the list itself - and, for removing
 * someone or cancelling their invite, to the person.
 */
export const bucketListConfirmCopy = (
  kind: BucketListConfirmKind,
  bucketList: Pick<BucketListDetail, 'name' | 'visibility'>,
  personName = '',
): BucketListConfirmCopy => {
  const isPublic = bucketList.visibility === 'public';

  switch (kind) {
    case 'delete':
      return {
        title: `Delete "${bucketList.name}"?`,
        body: 'This removes the list for you and everyone on it. The experiences and places themselves stay on Tukai. You can’t undo this.',
        confirmLabel: 'Delete bucket list',
        cancelLabel: 'Keep bucket list',
      };
    case 'leave':
      return {
        title: `Leave "${bucketList.name}"?`,
        body: isPublic
          ? 'It moves out of Following. The list stays public, so you can join again any time.'
          : 'You lose access straight away. Only the owner can invite you back.',
        confirmLabel: 'Leave bucket list',
        cancelLabel: 'Stay',
      };
    case 'remove':
      return {
        title: `Remove ${personName} from "${bucketList.name}"?`,
        body: isPublic
          ? 'They stop following this list. It stays public, so they can join again.'
          : 'They lose access straight away. You can invite them again later.',
        confirmLabel: 'Remove from bucket list',
        cancelLabel: 'Cancel',
      };
    case 'cancel-invite':
      return {
        title: `Cancel the invite to ${personName}?`,
        body: 'The invite stops working straight away. You can send a new one later.',
        confirmLabel: 'Cancel invite',
        cancelLabel: 'Keep invite',
      };
  }
};

/** What the toast says once a confirmed action has gone through. */
export const bucketListConfirmDoneToast = (
  kind: BucketListConfirmKind,
  bucketList: Pick<BucketListDetail, 'name' | 'visibility'>,
  personName = '',
): string => {
  const isPublic = bucketList.visibility === 'public';

  switch (kind) {
    case 'delete':
      return `Deleted ${bucketList.name}. The experiences and places on it are still on Tukai.`;
    case 'leave':
      return isPublic
        ? `You left ${bucketList.name}. It is still public if you want to join again.`
        : `You left ${bucketList.name}. Only the owner can invite you back.`;
    case 'remove':
      return isPublic
        ? `${personName} was removed. It no longer shows in their Following.`
        : `${personName} was removed. They can no longer open this list.`;
    case 'cancel-invite':
      return `Invite to ${personName} cancelled.`;
  }
};

/** Who is allowed to put something new on the list - the owner, and a
 * private list's own members. A public list's members browse it, same as
 * anyone else, but do not add to it. */
export const canAddToBucketList = (isOwner: boolean, isMember: boolean, isPublic: boolean) =>
  isOwner || (isMember && !isPublic);

export type RosterCaption = '' | 'Owner' | 'Owner (you)' | 'You' | 'Invited';

export interface RosterPerson {
  user: LinkedUser;
  name: string;
  caption: RosterCaption;
  isPending: boolean;
  isSelf: boolean;
}

/**
 * Everyone on a list, in the order Members shows them: the owner, then the
 * reader when they are a member, then the other members, then the invites
 * still waiting.
 *
 * `members` is the owner-only members endpoint where there is one - it is the
 * only source that carries pending invites - and the detail's own accepted
 * members otherwise.
 */
export const bucketListRoster = (
  bucketList: Pick<BucketListDetail, 'owner' | 'members'>,
  members: BucketListMember[] | undefined,
  userId?: string | null,
): RosterPerson[] => {
  const source = members ?? bucketList.members ?? [];
  const ownerId = bucketList.owner?.id;
  const person = (user: LinkedUser, caption: RosterCaption, isPending = false): RosterPerson => ({
    user,
    name: linkedUserName(user),
    caption,
    isPending,
    isSelf: Boolean(userId) && user.id === userId,
  });

  const others = source.filter((member) => member.user && member.user.id !== ownerId);
  const accepted = others.filter((member) => member.status === 'accepted');
  const pending = others.filter((member) => member.status === 'pending');

  const self = accepted.find((member) => member.user.id === userId);
  const rest = accepted.filter((member) => member !== self);

  return [
    ...(bucketList.owner
      ? [person(bucketList.owner, ownerId === userId ? 'Owner (you)' : 'Owner')]
      : []),
    ...(self ? [person(self.user, 'You')] : []),
    ...rest.map((member) => person(member.user, '')),
    ...pending.map((member) => person(member.user, 'Invited', true)),
  ];
};

/**
 * Members search: by name, and by the username or email where the person
 * record carries one. A leading "@" is ignored, so "@amina" finds Amina.
 */
export const filterRoster = (roster: RosterPerson[], query: string): RosterPerson[] => {
  const needle = query.trim().replace(/^@/, '').toLowerCase();
  if (!needle) return roster;

  return roster.filter(({ user, name }) => {
    const extra = user as LinkedUser & { username?: string; email?: string };

    return [name, extra.username, extra.email].some((field) =>
      field?.toLowerCase().includes(needle),
    );
  });
};

/** "3 members", or "3 members, 1 invited". The owner is not counted. */
export const rosterCountLine = (roster: RosterPerson[]): string => {
  const members = roster.filter(
    (person) => !person.isPending && !person.caption.startsWith('Owner'),
  ).length;
  const invited = roster.filter((person) => person.isPending).length;
  const line = `${members} ${members === 1 ? 'member' : 'members'}`;

  return invited > 0 ? `${line}, ${invited} invited` : line;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** A complete email address, the point at which it can be invited directly. */
export const isEmailAddress = (value: string) => EMAIL.test(value.trim());

/** "Send invite", or "Send 3 invites". */
export const inviteSendLabel = (count: number) =>
  count > 1 ? `Send ${count} invites` : 'Send invite';

/** What the toast says once the invites are out, naming the first person. */
export const inviteSentToast = (firstNames: string[]): string => {
  const [first, ...rest] = firstNames;

  if (rest.length === 0) {
    return `Invite sent to ${first}. They can open the list once they accept.`;
  }

  return `Invites sent to ${first} and ${rest.length} ${rest.length === 1 ? 'other' : 'others'}. They can open the list once they accept.`;
};
