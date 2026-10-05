import { BucketList } from '@/types/bucket-list';

import {
  CARD_STATE_LABEL,
  bucketListCardState,
  countLine,
  isListMember,
  savedLine,
} from './bucket-list-card';

const list = (overrides: Partial<BucketList> = {}): BucketList =>
  ({
    id: 'b1',
    name: 'Weekend Hikes',
    visibility: 'public',
    itemCount: 12,
    memberCount: 4,
    owner: { id: 'm1' },
    ...overrides,
  }) as BucketList;

describe('isListMember', () => {
  // The list serializer sends this as a string
  it.each([
    [true, true],
    ['true', true],
    ['false', false],
    [false, false],
    [undefined, false],
  ])('reads %s as %s', (value, expected) => {
    expect(isListMember(list({ isMember: value as BucketList['isMember'] }))).toBe(expected);
  });
});

describe('bucketListCardState', () => {
  it('is yours when you own it', () => {
    expect(bucketListCardState(list({ owner: { id: 'me' } }), 'me')).toBe('owned');
  });

  it("is joined when you are a member of another person's list", () => {
    expect(bucketListCardState(list({ isMember: true }), 'me')).toBe('joined');
  });

  it('is joinable otherwise', () => {
    expect(bucketListCardState(list(), 'me')).toBe('joinable');
  });

  // Signed out, nothing is yours
  it('is joinable when nobody is signed in', () => {
    expect(bucketListCardState(list({ owner: { id: 'me' } }), undefined)).toBe('joinable');
  });

  it('carries the labels the canvas uses', () => {
    expect(CARD_STATE_LABEL).toEqual({
      owned: 'Open list',
      joined: 'Joined',
      joinable: 'Join list',
    });
  });
});

describe('savedLine', () => {
  it('counts what is on the list', () => {
    expect(savedLine(list())).toBe('12 saved');
  });

  it('copes with a list that has nothing on it', () => {
    expect(savedLine(list({ itemCount: 0 }))).toBe('0 saved');
  });
});

/**
 * The canvas carries both wordings and uses them in different places: "N saved"
 * on a card, "N ideas, M members" on the list's own page.
 */
describe('countLine', () => {
  it('counts ideas and members', () => {
    expect(countLine(list())).toBe('12 ideas, 4 members');
  });

  it('counts one idea in the singular', () => {
    expect(countLine(list({ itemCount: 1 }))).toBe('1 idea, 4 members');
  });

  it('leaves the members out when a list has none', () => {
    expect(countLine(list({ memberCount: 0 }))).toBe('12 ideas');
  });
});
