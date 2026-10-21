import { BucketListDetail } from '@/types/bucket-list';

import {
  BUCKET_LIST_UNAVAILABLE_COPY,
  bucketListConfirmCopy,
  bucketListUnavailableReason,
  canAddToBucketList,
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
