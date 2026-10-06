/**
 * How often a break rail sits between runs of moments. Every third is the
 * design's default (docs/design/PENDING.md, Feed mix).
 */
export type FeedMix = 'every-third' | 'every-other' | 'newest';

export const FEED_MIX_DEFAULT: FeedMix = 'every-third';

/** Moments in each run before a rail. Null means no rails at all. */
const RUN_LENGTH: Record<FeedMix, number | null> = {
  'every-third': 3,
  'every-other': 2,
  newest: null,
};

/**
 * Splits the feed into runs of moments. A break rail goes after every run but
 * the last, so the feed never ends on a rail and a new page can add to the
 * last run without moving the rails already placed.
 */
export const splitIntoRuns = <T>(items: T[], mix: FeedMix): T[][] => {
  const length = RUN_LENGTH[mix];
  if (items.length === 0) return [];
  if (length === null) return [items];

  const runs: T[][] = [];
  for (let start = 0; start < items.length; start += length) {
    runs.push(items.slice(start, start + length));
  }
  return runs;
};
