/**
 * Canvas icon names to {@link IconComponent} names.
 *
 * The design canvas names Hugeicons directly - `hgi-ticket-01`, `hgi-compass`
 * - and the app already draws from that library, so an icon is a lookup rather
 * than a judgement call. 90 of the 95 icons the canvas uses convert by one
 * rule; the five that do not are listed below with the reason.
 *
 * Without this, every screen task re-answers "which icon is that" by eye, and
 * two screens pick different icons for the same thing.
 */

/** `hgi-shopping-basket-add-02` -> `ShoppingBasketAdd02Icon` */
const byRule = (canvasName: string): string =>
  canvasName
    .replace(/^hgi-/, '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') + 'Icon';

/**
 * Icons whose canvas name has no counterpart in the installed set, mapped to
 * the nearest one that carries the same meaning. Each is a judgement, so each
 * says what it stands for.
 */
const EXCEPTIONS: Record<string, string> = {
  // No accessibility glyph in the set; the wheelchair is the set's own symbol
  'hgi-accessibility': 'WheelchairIcon',
  // The set numbers its doors
  'hgi-door-open': 'Door01Icon',
  // One QR glyph covers both the canvas's scan names
  'hgi-qr-code-scan': 'QrCodeIcon',
  'hgi-qr-scan': 'QrCodeIcon',
  // No plain walking figure; this is the set's walking-exercise glyph
  'hgi-walking': 'WorkoutRunIcon',
};

/**
 * The icon name to hand {@link IconComponent}, for an icon named by the canvas.
 *
 * Returns `undefined` for a name the canvas does not use, so a typo surfaces
 * rather than rendering a silently wrong glyph.
 */
export const canvasIcon = (canvasName: string): string | undefined => {
  if (!canvasName?.startsWith('hgi-')) return undefined;

  return EXCEPTIONS[canvasName] ?? byRule(canvasName);
};

/**
 * The canvas's own shorthand, from the `IC` map at the top of its source. These
 * are the icons it reaches for repeatedly, under the names it calls them.
 */
export const CANVAS_ICONS = {
  compass: canvasIcon('hgi-compass')!,
  ticket: canvasIcon('hgi-ticket-01')!,
  pin: canvasIcon('hgi-location-01')!,
  camera: canvasIcon('hgi-camera-01')!,
  heart: canvasIcon('hgi-favourite')!,
  basket: canvasIcon('hgi-shopping-basket-add-02')!,
  basketDone: canvasIcon('hgi-shopping-basket-done-02')!,
  calendar: canvasIcon('hgi-calendar-03')!,
  users: canvasIcon('hgi-user-multiple')!,
  clock: canvasIcon('hgi-clock-01')!,
  repeat: canvasIcon('hgi-repeat')!,
  tag: canvasIcon('hgi-tag-01')!,
  check: canvasIcon('hgi-tick-02')!,
  star: canvasIcon('hgi-star')!,
  lock: canvasIcon('hgi-lock')!,
  globe: canvasIcon('hgi-globe')!,
  list: canvasIcon('hgi-list-view')!,
  sparkle: canvasIcon('hgi-sparkles')!,
} as const;
