/**
 * How the Moments feed lays itself out: whole rows of cards in blocks, with a
 * popular rail between one block and the next.
 */

/** Blocks on screen at first, and how many each Show more adds. */
export const BLOCKS_PER_PAGE = 3;

/** Assumed until the grid has been measured. */
export const DEFAULT_FEED_COLUMNS = 4;

/**
 * Cards in a block: whole rows, at least two of them and at least six cards,
 * so a rail never cuts a row short. 10 at five columns, 8 at four, 6 at three,
 * then 2 a block on a narrow screen.
 */
export const blockSize = (columns: number): number => {
  const safe = Math.max(1, Math.floor(columns));
  return safe * Math.max(2, Math.ceil(6 / safe));
};

/** The rails in the order they take turns, round and round. */
export const POPULAR_RAILS = ['restaurants', 'communities', 'bucketLists', 'experiences'] as const;

export type PopularRailKind = (typeof POPULAR_RAILS)[number];

/** The nth rail in the feed. */
export const popularRailAt = (index: number): PopularRailKind =>
  POPULAR_RAILS[index % POPULAR_RAILS.length];

export type FeedEntry<T> = { kind: 'card'; item: T } | { kind: 'rail'; index: number };

/**
 * The cards with a rail after each full block. No rail follows the last card,
 * so the feed never ends on one, and a Show more that adds cards puts the next
 * rail between the old last card and the new ones.
 */
export const layoutFeed = <T>(items: T[], size: number): FeedEntry<T>[] => {
  const entries: FeedEntry<T>[] = [];

  items.forEach((item, index) => {
    entries.push({ kind: 'card', item });

    const shown = index + 1;
    if (shown % size === 0 && shown < items.length) {
      entries.push({ kind: 'rail', index: shown / size - 1 });
    }
  });

  return entries;
};
