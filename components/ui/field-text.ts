/**
 * How text reads inside a field, taken from {@link Input} — the field every
 * other one is measured against.
 *
 * Selects, textareas, the phone field and the editor all had sizes of their
 * own, so a form mixed 12px, 14px and 14.5px in boxes that sat side by side.
 * They share this instead.
 *
 * `leading` must be written after the size: tailwind-merge treats a `text-*`
 * utility as also setting line-height, so an earlier `leading-*` is dropped.
 */
export const FIELD_TEXT = 'text-[14.5px] font-normal leading-[18px] text-gray-800';

/** The same, without a line-height — for anything setting its own. */
export const FIELD_TEXT_SIZE = 'text-[14.5px] font-normal';

/** A placeholder is told apart by colour, not by weight or size. */
export const FIELD_PLACEHOLDER = 'placeholder:text-gray-400';

/**
 * An icon sitting inside a field.
 *
 * Call sites pass their own `size` — 14, 16 and 18 were all in use — so the box
 * is pinned here in CSS, which wins over the width/height attributes an icon
 * sets for itself. The colour is only inherited, so an icon that means
 * something by being red or green still says it.
 */
export const FIELD_ICON =
  'flex flex-shrink-0 items-center text-gray-400 [&_svg]:h-[18px] [&_svg]:w-[18px]';

/**
 * The label above a field. 14px against the field's 14.5px — a shade smaller
 * without being the 12px it used to be, which read as fine print beside the
 * text it named.
 */
export const FIELD_LABEL = 'text-sm font-medium text-gray-800';
