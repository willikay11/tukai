import {
  CARD_LIFT,
  FADE_IN,
  MEDIA_ZOOM,
  POP_ONCE,
  PRESSABLE,
  ROW_HOVER,
  TITLE_TINT,
} from './motion-classes';

/**
 * These guard the convention rather than the styling: a token added later that
 * moves something without an escape hatch would ship motion to readers who
 * asked for none, and jsdom cannot catch that by rendering.
 */
describe('motion tokens', () => {
  const moving = { CARD_LIFT, MEDIA_ZOOM, PRESSABLE };
  const animating = { POP_ONCE, FADE_IN };
  const colourOnly = { ROW_HOVER, TITLE_TINT };

  it.each(Object.entries(moving))(
    '%s opts out of movement under reduced motion',
    (_name, token) => {
      expect(token).toContain('motion-reduce:transform-none');
    },
  );

  it.each(Object.entries(animating))('%s only animates when motion is welcome', (_name, token) => {
    expect(token).toContain('motion-safe:');
  });

  // Colour is not motion — a hover that only recolours stays on for everyone,
  // and the global reduced-motion rule shortens it to an instant change
  it.each(Object.entries(colourOnly))('%s is a colour change, not a movement', (_name, token) => {
    expect(token).toMatch(/transition-colors/);
    expect(token).not.toMatch(/translate|scale|rotate/);
  });

  it.each([...Object.entries(moving), ...Object.entries(animating), ...Object.entries(colourOnly)])(
    '%s names a duration or an animation',
    (_name, token) => {
      expect(token).toMatch(/duration-\d+|animate-/);
    },
  );
});
