import { Moment, momentPhotos } from '@/types/moment';

/** Two tiles a column, so the rail holds up to forty moments. */
export const RAIL_MAX_COLUMNS = 20;

/** Forty tiles, then three for the See all card's stack. */
export const RAIL_FETCH_SIZE = RAIL_MAX_COLUMNS * 2 + 3;

/** A column's 130px plus the 5px gap before the next. */
const COLUMN_STEP = 135;

export type RailTile = {
  moment: Moment;
  /** The tile's share of its column: 2 is the short one, 3 the tall one. */
  grow: 2 | 3;
};

/**
 * The rail's columns, two moments each in feed order.
 *
 * The tiles split a column 2 : 3, and the short one swaps ends from column to
 * column - first, third, fifth on top - so the gap between them zigzags along
 * the rail. A lone moment left over at the end is dropped rather than drawn
 * as a half-empty column.
 */
export const railColumns = (moments: Moment[]): [RailTile, RailTile][] => {
  const count = Math.min(RAIL_MAX_COLUMNS, Math.floor(moments.length / 2));

  return Array.from({ length: count }, (_, column) => {
    const shortOnTop = column % 2 === 0;
    return [
      { moment: moments[column * 2], grow: shortOnTop ? 2 : 3 },
      { moment: moments[column * 2 + 1], grow: shortOnTop ? 3 : 2 },
    ];
  });
};

/**
 * The See all card's three photos: the moments just past the rail's last
 * tile, as a peek at what comes next - or the feed's first three when there
 * are not three more. Left, centre, right.
 */
export const stackPhotos = (moments: Moment[], columnCount: number): (string | null)[] => {
  const used = columnCount * 2;
  const peek = moments.length >= used + 3 ? moments.slice(used, used + 3) : moments.slice(0, 3);

  return peek.map((moment) => momentPhotos(moment)[0]?.photo ?? null);
};

/** How far an arrow scrolls: as many whole columns as fit, and at least one. */
export const railStep = (railWidth: number): number =>
  Math.max(COLUMN_STEP, Math.floor(railWidth / COLUMN_STEP) * COLUMN_STEP);
