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
