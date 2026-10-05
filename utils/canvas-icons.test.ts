import fs from 'fs';
import path from 'path';

import { CANVAS_ICONS, canvasIcon } from './canvas-icons';

/**
 * Every icon name the design canvas uses, extracted from its source. The point
 * of this test is that all of them resolve to an icon that actually exists in
 * the installed set - a name that does not resolve renders nothing at all, and
 * a blank space in a card is easy to miss in review.
 */
const CANVAS_NAMES = fs
  .readFileSync(path.join(__dirname, '../__tests__/canvas-icon-names.txt'), 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

const installed = new Set(
  Array.from(
    fs
      .readFileSync(
        path.join(
          __dirname,
          '../node_modules/@hugeicons-pro/core-twotone-rounded/dist/types/index.d.ts',
        ),
        'utf8',
      )
      .matchAll(/declare const (\w+): IconSvgObject/g),
  ).map((match) => match[1]),
);

describe('canvasIcon', () => {
  it('converts a canvas name by the naming rule', () => {
    expect(canvasIcon('hgi-shopping-basket-add-02')).toBe('ShoppingBasketAdd02Icon');
    expect(canvasIcon('hgi-compass')).toBe('CompassIcon');
  });

  it('ignores anything that is not a canvas icon name', () => {
    expect(canvasIcon('CompassIcon')).toBeUndefined();
    expect(canvasIcon('')).toBeUndefined();
  });

  // A name that resolves to nothing renders a blank space, which review misses
  it.each(CANVAS_NAMES)('%s resolves to an icon that exists', (name) => {
    const resolved = canvasIcon(name);

    expect(resolved).toBeDefined();
    expect(installed.has(resolved as string)).toBe(true);
  });

  it('covers every icon the canvas uses', () => {
    expect(CANVAS_NAMES.length).toBe(95);
  });
});

describe('CANVAS_ICONS', () => {
  it('carries the canvas shorthand', () => {
    expect(CANVAS_ICONS.basket).toBe('ShoppingBasketAdd02Icon');
    expect(CANVAS_ICONS.ticket).toBe('Ticket01Icon');
  });

  it.each(Object.entries(CANVAS_ICONS))('%s (%s) exists in the set', (_key, icon) => {
    expect(installed.has(icon)).toBe(true);
  });
});
