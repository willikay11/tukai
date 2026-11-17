/** Cards the collapsed rail holds before the See all tile. */
export const RAIL_LIMIT = 10;

// The whole-cards rule is shared by every rail; it lives with the rails
export { railCardWidth } from '@/app/shared/components/Lists/railCardWidth';

/** The gap between rail cards. */
const GAP = 16;

/** The width before the rail has been measured. */
export const DEFAULT_CARD_WIDTH = 184;

/** How far an arrow scrolls: as many whole cards as fit, and at least one. */
export const railStep = (railWidth: number, cardWidth: number): number => {
  const card = cardWidth + GAP;
  return Math.max(card, Math.floor(railWidth / card) * card);
};
