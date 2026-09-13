/**
 * The app's micro-animation vocabulary, as Tailwind class strings.
 *
 * These are shared rather than retyped per component so the whole app moves at
 * the same speed and with the same easing — a card that lifts in 150ms next to
 * one that takes 400ms reads as a bug, not as polish.
 *
 * Every token pairs its motion with a `motion-reduce:` escape. `globals.css`
 * also cuts animation app-wide under `prefers-reduced-motion`, so the escapes
 * here are belt-and-braces: they keep the *hover state* meaningful (a border
 * still changes colour) while dropping only the movement.
 *
 * Durations: 150ms for a press, 200ms for colour, 300ms for a lift, 500ms for a
 * photo zoom. Anything longer is noticeable as an effect rather than felt as
 * responsiveness.
 */

/** Photo inside a `group` card: eases up in scale as the card is hovered. */
export const MEDIA_ZOOM =
  'transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transform-none motion-reduce:transition-none';

/** The card itself: a small lift so the hovered one sits above its row. */
export const CARD_LIFT =
  'transition duration-300 ease-out hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none';

/** A card's title, tinted as the card is hovered. */
export const TITLE_TINT = 'transition-colors duration-200 group-hover:text-primary';

/** Anything clickable that is not a `Button`: icon circles, pills, chips. */
export const PRESSABLE =
  'transition duration-150 ease-out active:scale-95 motion-reduce:transform-none motion-reduce:transition-none';

/** A row in a list that highlights under the pointer. */
export const ROW_HOVER = 'transition-colors duration-200 ease-out hover:bg-gray-50';

/** Confirmation beat: plays once when something is saved or toggled on. */
export const POP_ONCE = 'motion-safe:animate-pop';

/** Content that has just appeared in place — an inline error, a revealed panel. */
export const FADE_IN = 'motion-safe:animate-fade-in-up';
