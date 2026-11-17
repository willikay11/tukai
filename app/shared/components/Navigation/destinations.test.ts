import { DESTINATIONS, Destination, isDestinationActive } from './destinations';

const destination = (label: string): Destination =>
  DESTINATIONS.find((one) => one.label === label) as Destination;

/**
 * The mobile handoff's four, in its order. Experiences, Places and Moments are
 * tabs on Discover, and Plans is in the account menu - but they keep their
 * URLs, so every link to them still resolves.
 */
describe('DESTINATIONS', () => {
  it('carries the handoff four, in order', () => {
    expect(DESTINATIONS.map((one) => one.label)).toEqual([
      'Discover',
      'Bucket lists',
      'Communities',
      'You',
    ]);
  });

  it('points each at a route that exists', () => {
    expect(DESTINATIONS.map((one) => one.href)).toEqual([
      '/',
      '/bucket-lists',
      '/communities',
      '/profile',
    ]);
  });

  // Only "You" wears the reader's own face
  it('marks one destination as the reader', () => {
    expect(DESTINATIONS.filter((one) => one.showsFace).map((one) => one.label)).toEqual(['You']);
  });

  // Signed out, these two ask for an account instead of going
  it('asks for an account on Bucket lists and You only', () => {
    expect(DESTINATIONS.filter((one) => one.needsAccount).map((one) => one.label)).toEqual([
      'Bucket lists',
      'You',
    ]);
  });
});

describe('isDestinationActive', () => {
  it('lights a destination on its own path', () => {
    expect(isDestinationActive(destination('Communities'), '/communities')).toBe(true);
  });

  it('lights it on a path beneath it', () => {
    expect(isDestinationActive(destination('Communities'), '/communities/nairobi-hikers')).toBe(
      true,
    );
  });

  /**
   * Discover is the root. Matching by prefix would light it on every page in
   * the app, which is the bug this exists to avoid.
   */
  it('lights Discover on the root, not on every page', () => {
    expect(isDestinationActive(destination('Discover'), '/')).toBe(true);
    expect(isDestinationActive(destination('Discover'), '/plans')).toBe(false);
    expect(isDestinationActive(destination('Discover'), '/communities')).toBe(false);
  });

  it.each(['/experiences', '/places', '/moments', '/experiences/sunrise-hike'])(
    'lights Discover on its other faces: %s',
    (pathname) => {
      expect(isDestinationActive(destination('Discover'), pathname)).toBe(true);
    },
  );

  it.each(['/profile', '/help', '/dashboard', '/dashboard/places/kraftory'])(
    'lights You on %s',
    (pathname) => {
      expect(isDestinationActive(destination('You'), pathname)).toBe(true);
    },
  );

  // A route that merely starts with the same letters is a different place
  it('does not light a destination on a path that only begins like it', () => {
    expect(isDestinationActive(destination('Communities'), '/communitiesx')).toBe(false);
  });

  it('leaves everything dark on an unrelated path', () => {
    expect(DESTINATIONS.some((one) => isDestinationActive(one, '/plans'))).toBe(false);
  });
});
