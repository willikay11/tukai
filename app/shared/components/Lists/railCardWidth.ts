/**
 * A rail card's width from `2xl` up: a fraction of the row rather than a
 * fixed pixel size, so exactly 6 cards (7 from `3xl`) always fill the row
 * edge to edge - never a card half cut off at the end. Below `2xl` cards keep
 * their own fixed width and the row scrolls past however many fit.
 */
export const RAIL_CARD_RESPONSIVE_WIDTH =
  '2xl:w-[calc((100%_-_80px)/6)] 3xl:w-[calc((100%_-_96px)/7)] 4xl:w-[calc((100%_-_96px)/7)]';
