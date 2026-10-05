import { DESTINATIONS, isDestinationActive } from './destinations';

/**
 * The canvas's five, in its order. Experiences, Places and Moments are tabs on
 * Discover there, not destinations - but they keep their URLs, so every link
 * to them still resolves.
 */
describe('DESTINATIONS', () => {
  it('carries the canvas five, in order', () => {
    expect(DESTINATIONS.map((one) => one.label)).toEqual([
      'Discover',
      'Bucket lists',
      'Communities',
      'Plans',
      'You',
    ]);
  });

  it('points each at a route that exists', () => {
    expect(DESTINATIONS.map((one) => one.href)).toEqual([
      '/',
      '/bucket-lists',
      '/communities',
      '/plans',
      '/profile',
    ]);
  });

  // Only "You" wears the reader's own face
  it('marks one destination as the reader', () => {
    expect(DESTINATIONS.filter((one) => one.showsFace).map((one) => one.label)).toEqual(['You']);
  });
});

describe('isDestinationActive', () => {
  it('lights a destination on its own path', () => {
    expect(isDestinationActive('/plans', '/plans')).toBe(true);
  });

  it('lights it on a path beneath it', () => {
    expect(isDestinationActive('/communities', '/communities/nairobi-hikers')).toBe(true);
  });

  /**
   * Discover is the root. Matching by prefix would light it on every page in
   * the app, which is the bug this exists to avoid.
   */
  it('lights Discover only on the root', () => {
    expect(isDestinationActive('/', '/')).toBe(true);
    expect(isDestinationActive('/', '/plans')).toBe(false);
    expect(isDestinationActive('/', '/experiences/sunrise-hike')).toBe(false);
  });

  // A route that merely starts with the same letters is a different place
  it('does not light a destination on a path that only begins like it', () => {
    expect(isDestinationActive('/plans', '/planside')).toBe(false);
  });

  it('leaves everything dark on an unrelated path', () => {
    expect(isDestinationActive('/bucket-lists', '/moments')).toBe(false);
  });
});
