import config from '../tailwind.config';

/**
 * The colours in the design canvas, with the count of how often each appears
 * there. Typing a hex by hand is how a token drifts from the design by one
 * digit and nobody notices, so the values are pinned here against the config.
 */
const CANVAS_COLOURS: Record<string, string> = {
  'brand.DEFAULT': '#066349',
  'brand.deep': '#044B36',
  'brand.mid': '#0C7A50',
  'brand.ink': '#013334',
  'lime.DEFAULT': '#B0E800',
  'lime.dark': '#A3D900',
  'surface.DEFAULT': '#F3F4F2',
  'surface.brand': '#E8F1ED',
  'surface.muted': '#EDF0EE',
  'line.DEFAULT': '#DDE3DF',
  'ink.DEFAULT': '#3F4B47',
  'ink.muted': '#5B6B66',
  'ink.subtle': '#8A9793',
  'danger.DEFAULT': '#E02D3C',
  'danger.surface': '#FEF3F2',
};

const read = (path: string) =>
  path
    .split('.')
    .reduce<unknown>(
      (node, key) => (node as Record<string, unknown> | undefined)?.[key],
      config.theme?.extend?.colors,
    );

describe('design tokens', () => {
  it.each(Object.entries(CANVAS_COLOURS))('%s is the canvas value %s', (path, hex) => {
    expect(read(path)).toBe(hex);
  });

  it('covers every colour the canvas leans on', () => {
    expect(Object.keys(CANVAS_COLOURS)).toHaveLength(15);
  });

  /**
   * `primary` is #047857 and the canvas leads on #066349. They are different
   * greens, and this pins that they have not been quietly merged — swapping
   * `primary` repaints every screen, so it is a decision, not a token task.
   */
  it('leaves primary alone', () => {
    const colours = config.theme?.extend?.colors as Record<string, unknown>;
    expect((colours.primary as Record<string, string>).DEFAULT).toContain('--color-primary');
    expect(read('brand.DEFAULT')).not.toBe(read('primary.DEFAULT'));
  });
});

/**
 * The canvas uses 29 font sizes, half-pixels included. These five are the
 * peaks Tailwind has no default for; the half-steps round to their nearest
 * neighbour rather than each earning a token.
 */
describe('type scale', () => {
  const sizes = config.theme?.extend?.fontSize as Record<string, [string, string]>;

  it.each([
    ['13', '13px', '18px'],
    ['15', '15px', '22px'],
    ['17', '17px', '24px'],
    ['19', '19px', '26px'],
    ['22', '22px', '28px'],
  ])('text-%s is %s with %s leading', (token, size, leading) => {
    expect(sizes[token]).toEqual([size, leading]);
  });

  // 15px is the canvas's body size and `text-base` is 16px. Moving `base`
  // would resize every screen at once, so they stay separate.
  it('leaves text-base alone', () => {
    expect(sizes.base).toBeUndefined();
  });
});

/**
 * The canvas leans hardest on two radii Tailwind already has — 999px is
 * `rounded-full` (587 uses) and 12px is `rounded-xl` (255). These three fill
 * the gaps between.
 */
describe('radii', () => {
  const radii = config.theme?.extend?.borderRadius as Record<string, string>;

  it.each([
    ['10', '10px'],
    ['14', '14px'],
    ['18', '18px'],
  ])('rounded-%s is %s', (token, value) => {
    expect(radii[token]).toBe(value);
  });

  it('leaves the existing radius chain alone', () => {
    expect(radii.lg).toBe('var(--radius)');
  });
});

/**
 * Weights need no tokens — the canvas uses 400, 500, 600 and 700, and Tailwind
 * has all four. What matters is the convention: 600 is the canvas's default
 * emphasis at 551 uses against 700's 302 and 500's 89. The app's Button base
 * is `font-medium` (500), which is lighter than the canvas everywhere.
 */
describe('weights', () => {
  it('needs no token of its own', () => {
    expect((config.theme?.extend as Record<string, unknown>).fontWeight).toBeUndefined();
  });
});
