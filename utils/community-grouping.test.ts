import { Community } from '@/types/community';

import { buildCommunityGroups, tintForCategory } from './community-grouping';

const community = (
  id: string,
  categories: { id: string; name: string; icon: string }[] = [],
): Community => ({ id, title: `Community ${id}`, categories }) as unknown as Community;

const HIKING = { id: 'cat-hiking', name: 'Hiking', icon: 'Directions01Icon' };
const SHOPPING = { id: 'cat-shopping', name: 'Shopping', icon: 'ShoppingBasket01Icon' };

describe('buildCommunityGroups', () => {
  it('groups communities sharing a category', () => {
    const groups = buildCommunityGroups([
      community('a', [HIKING]),
      community('b', [HIKING]),
      community('c', [SHOPPING]),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].categoryName).toBe('Hiking');
    expect(groups[0].communities.map((entry) => entry.id)).toEqual(['a', 'b']);
  });

  // A community can carry several categories; filing it under all of them would
  // list it two or three times on the same page
  it('files a multi-category community under its first category only', () => {
    const groups = buildCommunityGroups([community('a', [SHOPPING, HIKING])]);

    expect(groups).toHaveLength(1);
    expect(groups[0].categoryName).toBe('Shopping');
  });

  it('takes the icon from the API category rather than a local map', () => {
    const groups = buildCommunityGroups([community('a', [HIKING])]);

    expect(groups[0].icon).toBe('Directions01Icon');
  });

  it('collects communities with no category under Other', () => {
    const groups = buildCommunityGroups([community('a', [])]);

    expect(groups[0].categoryName).toBe('Other');
    expect(groups[0].icon).toBe('UserGroupIcon');
  });

  it('orders the largest group first', () => {
    const groups = buildCommunityGroups([
      community('a', [SHOPPING]),
      community('b', [HIKING]),
      community('c', [HIKING]),
    ]);

    expect(groups.map((group) => group.categoryName)).toEqual(['Hiking', 'Shopping']);
  });

  // Equal-sized groups must not reshuffle between renders
  it('breaks ties by name so the order is stable', () => {
    const first = buildCommunityGroups([community('a', [SHOPPING]), community('b', [HIKING])]);
    const second = buildCommunityGroups([community('b', [HIKING]), community('a', [SHOPPING])]);

    expect(first.map((group) => group.categoryName)).toEqual(
      second.map((group) => group.categoryName),
    );
    expect(first.map((group) => group.categoryName)).toEqual(['Hiking', 'Shopping']);
  });

  it('returns nothing for an empty list', () => {
    expect(buildCommunityGroups([])).toEqual([]);
  });

  it('gives every group a tint', () => {
    const groups = buildCommunityGroups([community('a', [HIKING]), community('b', [SHOPPING])]);

    groups.forEach((group) => {
      expect(group.iconBgClass).toMatch(/^bg-/);
      expect(group.iconColorClass).toMatch(/^text-/);
    });
  });
});

describe('tintForCategory', () => {
  // The API gives categories an icon but no colour, so it is derived — and must
  // not change between renders or pages
  it('is stable for the same category', () => {
    expect(tintForCategory('cat-hiking')).toEqual(tintForCategory('cat-hiking'));
  });

  it('separates categories that would otherwise collide visually', () => {
    const seen = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map((id) => tintForCategory(id).bg));

    expect(seen.size).toBeGreaterThan(1);
  });
});
