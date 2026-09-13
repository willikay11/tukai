import { communityPath, experiencePath, placePath } from './detail-paths';

describe('detail paths', () => {
  // The slug is what the API returns for these and what reads well in a URL
  it('addresses a place by its slug', () => {
    expect(placePath({ id: '4d9a1a4a-c795', slug: 'kraftory-biergarten' })).toBe(
      '/places/kraftory-biergarten',
    );
  });

  it('addresses an experience by its slug', () => {
    expect(experiencePath({ id: 'aabac2f3-69ea', slug: 'karura-entry-fees' })).toBe(
      '/experiences/karura-entry-fees',
    );
  });

  it('addresses a community by its slug', () => {
    expect(communityPath({ id: '0914d67d-21a4', slug: 'city-scapes' })).toBe(
      '/communities/city-scapes',
    );
  });

  // A record the API has not slugged yet still has to be reachable — and the
  // detail endpoints resolve the UUID just as happily
  it('falls back to the id when there is no slug', () => {
    expect(placePath({ id: 'p1' })).toBe('/places/p1');
    expect(experiencePath({ id: 'e1', slug: '' })).toBe('/experiences/e1');
    expect(communityPath({ id: 'c1' })).toBe('/communities/c1');
  });
});
