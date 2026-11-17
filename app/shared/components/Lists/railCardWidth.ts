/** The gap between rail cards. */
const GAP = 16;

/** The narrowest a card gets before a column is dropped. */
const MIN_CARD = 168;

/**
 * The CSS variable `ScrollRow` writes its measured card width into, for the
 * cards inside it to read.
 */
export const RAIL_CARD_WIDTH_VAR = '--rail-card-w';

/**
 * The rail's card width, so whole cards fill it edge to edge: as many 168px
 * columns as fit, and never fewer than two, sharing what is left over.
 * Rounded down to the hundredth so rounding never pushes the last card over.
 *
 * `railWidth` is the scroll box's client width; its 2px of side padding each
 * way come off first.
 */
export const railCardWidth = (railWidth: number): number | null => {
  const width = railWidth - 4;
  if (width <= 0) return null;

  const columns = Math.max(2, Math.floor((width + GAP) / (MIN_CARD + GAP)));
  return Math.floor(((width - (columns - 1) * GAP) / columns) * 100) / 100;
};

/**
 * A rail card's width: whatever its `ScrollRow` measured, so the rail shows
 * whole cards at every width and never fewer than two. 184px until it has
 * been measured, the size the cards were drawn at.
 *
 * Merged through `cn`, so it takes over from a card's own fixed width.
 */
export const RAIL_CARD_RESPONSIVE_WIDTH = 'w-[var(--rail-card-w,184px)]';
