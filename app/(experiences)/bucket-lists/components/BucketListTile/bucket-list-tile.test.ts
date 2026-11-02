import { BucketList } from '@/types/bucket-list';

import { tileAccessibleName, tileFaces, tileSavedLine } from './bucket-list-tile';

const list = (overrides: Partial<BucketList> = {}): BucketList => ({
  id: 'bl1',
  name: 'Slow Sundays',
  visibility: 'public',
  itemCount: 6,
  memberCount: 0,
  owner: { id: 'o', displayName: 'Otieno Ouma' },
  ...overrides,
});

describe('tileAccessibleName', () => {
  it('names the owner on Discover and Following', () => {
    expect(tileAccessibleName(list(), 'owner')).toBe('Slow Sundays, by Otieno Ouma, 6 saved');
  });

  it('names the visibility on My bucket lists', () => {
    expect(tileAccessibleName(list({ visibility: 'private' }), 'visibility')).toBe(
      'Slow Sundays, Private, 6 saved',
    );
  });
});

describe('tileSavedLine', () => {
  it('reads a missing count as none', () => {
    expect(tileSavedLine({ itemCount: undefined as unknown as number })).toBe('0 saved');
  });
});

describe('tileFaces', () => {
  it('shows up to three accepted members who are not the owner, and counts the rest', () => {
    const members = ['a', 'b', 'c', 'd'].map((id) => ({
      id: `m-${id}`,
      status: 'accepted' as const,
      user: { id },
    }));
    const result = tileFaces({ ...list({ memberCount: 24 }), members } as BucketList);

    expect(result.faces).toHaveLength(3);
    expect(result.extra).toBe(21);
  });

  it('falls back to the bare count when the collection carries no people', () => {
    expect(tileFaces(list({ memberCount: 7 }))).toEqual({ faces: [], extra: 7, count: 7 });
  });
});
