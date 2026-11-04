/** Cards the collapsed rail holds before the See all tile. */
export const RAIL_LIMIT = 10;

/** The gap between rail cards. */
const GAP = 16;

/** The narrowest a card gets before a column is dropped. */
const MIN_CARD = 168;

/** The width before the rail has been measured. */
export const DEFAULT_CARD_WIDTH = 184;

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

/** How far an arrow scrolls: as many whole cards as fit, and at least one. */
export const railStep = (railWidth: number, cardWidth: number): number => {
  const card = cardWidth + GAP;
  return Math.max(card, Math.floor(railWidth / card) * card);
};
