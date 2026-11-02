import { BucketListDetail } from '@/types/bucket-list';

import {
  BUCKET_LIST_UNAVAILABLE_COPY,
  bucketListConfirmCopy,
  bucketListRoster,
  bucketListUnavailableReason,
  canAddToBucketList,
  filterRoster,
  inviteSendLabel,
  inviteSentToast,
  isEmailAddress,
  rosterCountLine,
  withoutList,
} from './bucket-list-drawer';

const list = (overrides: Partial<BucketListDetail> = {}): BucketListDetail =>
  ({
    id: 'bl1',
    name: 'Weekend in Naivasha',
    visibility: 'public',
    itemCount: 0,
    memberCount: 0,
    items: [],
    ...overrides,
  }) as BucketListDetail;

describe('bucketListUnavailableReason', () => {
  it('reads a 404 as gone', () => {
    expect(bucketListUnavailableReason(404)).toBe('gone');
  });

  it.each([403, 401, 500, undefined])('reads %s as locked', (status) => {
    expect(bucketListUnavailableReason(status)).toBe('locked');
  });

  it('has copy for both states', () => {
    expect(BUCKET_LIST_UNAVAILABLE_COPY.gone.title).toMatch(/no longer available/i);
    expect(BUCKET_LIST_UNAVAILABLE_COPY.locked.title).toMatch(/private/i);
  });
});

describe('bucketListConfirmCopy', () => {
  it('names the list in the delete prompt', () => {
    const copy = bucketListConfirmCopy('delete', list({ name: 'Weekend in Naivasha' }));

    expect(copy.title).toBe('Delete "Weekend in Naivasha"?');
    expect(copy.confirmLabel).toBe('Delete bucket list');
    expect(copy.cancelLabel).toBe('Keep bucket list');
  });

  it('tells a public leaver the list stays open to rejoin', () => {
    const copy = bucketListConfirmCopy('leave', list({ visibility: 'public' }));

    expect(copy.body).toMatch(/stays public/i);
    expect(copy.cancelLabel).toBe('Stay');
  });

  it('tells a private leaver they lose access immediately', () => {
    const copy = bucketListConfirmCopy('leave', list({ visibility: 'private' }));

    expect(copy.body).toMatch(/lose access straight away/i);
  });
});

describe('canAddToBucketList', () => {
  it('lets the owner add, on either visibility', () => {
    expect(canAddToBucketList(true, false, true)).toBe(true);
    expect(canAddToBucketList(true, false, false)).toBe(true);
  });

  it('lets a private list’s own members add', () => {
    expect(canAddToBucketList(false, true, false)).toBe(true);
  });

  it('keeps a public list’s members from adding - they only browse it', () => {
    expect(canAddToBucketList(false, true, true)).toBe(false);
  });

  it('keeps a visitor from adding', () => {
    expect(canAddToBucketList(false, false, true)).toBe(false);
  });
});

describe('withoutList', () => {
  it('takes a list and everything on top of it off, leaving what is below', () => {
    const stack = [
      { kind: 'list' as const, id: 'a' },
      { kind: 'list' as const, id: 'b' },
      { kind: 'members' as const, id: 'b' },
    ];

    expect(withoutList(stack, 'b')).toEqual([{ kind: 'list', id: 'a' }]);
  });

  it('leaves the stack alone for a list not in it', () => {
    const stack = [{ kind: 'list' as const, id: 'a' }];

    expect(withoutList(stack, 'z')).toBe(stack);
  });
});

describe('bucketListConfirmCopy for people', () => {
  const list = { name: 'Weekend', visibility: 'private' as const };

  it('names the person and the list when removing', () => {
    expect(bucketListConfirmCopy('remove', list, 'Kevo').title).toBe('Remove Kevo from "Weekend"?');
    expect(bucketListConfirmCopy('remove', list, 'Kevo').body).toMatch(/lose access/);
  });

  it('offers to keep an invite rather than cancel it', () => {
    const copy = bucketListConfirmCopy('cancel-invite', list, 'Njeri');

    expect(copy.title).toBe('Cancel the invite to Njeri?');
    expect(copy.cancelLabel).toBe('Keep invite');
  });
});

describe('bucketListRoster', () => {
  const owner = { id: 'o', displayName: 'Wanjiku Maina' };
  const member = (id: string, displayName: string, status = 'accepted') => ({
    id: `m-${id}`,
    status: status as 'accepted' | 'pending',
    user: { id, displayName },
  });

  it('puts the owner first, then you, then the others, then invites', () => {
    const roster = bucketListRoster(
      { owner, members: [] },
      [member('p', 'Pending Person', 'pending'), member('k', 'Kevo'), member('me', 'Me')],
      'me',
    );

    expect(roster.map((person) => [person.name, person.caption])).toEqual([
      ['Wanjiku Maina', 'Owner'],
      ['Me', 'You'],
      ['Kevo', ''],
      ['Pending Person', 'Invited'],
    ]);
  });

  it('says "Owner (you)" when the reader owns it', () => {
    expect(bucketListRoster({ owner, members: [] }, [], 'o')[0].caption).toBe('Owner (you)');
  });

  it('counts members without the owner, and invites apart', () => {
    const roster = bucketListRoster(
      { owner, members: [] },
      [member('k', 'Kevo'), member('a', 'Amina'), member('p', 'Pat', 'pending')],
      'o',
    );

    expect(rosterCountLine(roster)).toBe('2 members, 1 invited');
  });

  it('filters by name, ignoring a leading @', () => {
    const roster = bucketListRoster({ owner, members: [] }, [member('k', 'Kevo')], 'o');

    expect(filterRoster(roster, '@kev').map((person) => person.name)).toEqual(['Kevo']);
  });
});

describe('invites', () => {
  it('knows a complete email address', () => {
    expect(isEmailAddress('amina@example.com')).toBe(true);
    expect(isEmailAddress('amina@')).toBe(false);
  });

  it('labels the send button by how many are going', () => {
    expect(inviteSendLabel(0)).toBe('Send invite');
    expect(inviteSendLabel(1)).toBe('Send invite');
    expect(inviteSendLabel(3)).toBe('Send 3 invites');
  });

  it('names the first person in the toast', () => {
    expect(inviteSentToast(['Amina'])).toBe(
      'Invite sent to Amina. They can open the list once they accept.',
    );
    expect(inviteSentToast(['Amina', 'Kevo'])).toBe(
      'Invites sent to Amina and 1 other. They can open the list once they accept.',
    );
  });
});
