import { Community, CommunityCategory } from '@/types/community';

export interface CommunityGroup {
  categoryId: string;
  categoryName: string;
  // Hugeicons name — comes from the API's own category record, so new
  // categories get an icon without a code change
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  communities: Community[];
}

// Paired background/foreground tints. The API gives every category an icon but
// no colour, so one is assigned from this palette — deterministically, by id,
// rather than from a hardcoded list of category names that goes stale the
// moment someone adds a category.
const TINTS: { bg: string; color: string }[] = [
  { bg: 'bg-orange-100', color: 'text-orange-500' },
  { bg: 'bg-pink-100', color: 'text-pink-500' },
  { bg: 'bg-emerald-100', color: 'text-emerald-600' },
  { bg: 'bg-sky-100', color: 'text-sky-500' },
  { bg: 'bg-violet-100', color: 'text-violet-500' },
  { bg: 'bg-amber-100', color: 'text-amber-600' },
  { bg: 'bg-rose-100', color: 'text-rose-500' },
  { bg: 'bg-teal-100', color: 'text-teal-600' },
];

const UNCATEGORISED = {
  id: '__uncategorised__',
  name: 'Other',
  icon: 'UserGroupIcon',
};

// Same id always lands on the same tint, across renders and across pages
export const tintForCategory = (categoryId: string) => {
  let hash = 0;
  for (let index = 0; index < categoryId.length; index += 1) {
    hash = (hash * 31 + categoryId.charCodeAt(index)) % 100_000;
  }
  return TINTS[hash % TINTS.length];
};

/**
 * Groups communities under a single category each.
 *
 * A community can carry several categories, so grouping by all of them would
 * list the same community two or three times on one page. It is filed under its
 * FIRST category — the one its card already shows as a badge — so each appears
 * exactly once and the card agrees with the group it sits in.
 *
 * Groups are ordered by size, largest first; ties fall back to name so the
 * order is stable between renders.
 */
export const buildCommunityGroups = (communities: Community[]): CommunityGroup[] => {
  const groups = new Map<string, CommunityGroup>();

  communities.forEach((community) => {
    const category: Pick<CommunityCategory, 'id' | 'name' | 'icon'> =
      community.categories?.[0] ?? UNCATEGORISED;

    const existing = groups.get(category.id);
    if (existing) {
      existing.communities.push(community);
      return;
    }

    const tint = tintForCategory(category.id);
    groups.set(category.id, {
      categoryId: category.id,
      categoryName: category.name,
      icon: category.icon || UNCATEGORISED.icon,
      iconBgClass: tint.bg,
      iconColorClass: tint.color,
      communities: [community],
    });
  });

  return Array.from(groups.values()).sort(
    (a, b) =>
      b.communities.length - a.communities.length || a.categoryName.localeCompare(b.categoryName),
  );
};
