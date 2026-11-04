import { blockSize, layoutFeed, popularRailAt } from './feed-blocks';

describe('blockSize', () => {
  // Whole rows, at least two of them and at least six cards
  it.each([
    [5, 10],
    [4, 8],
    [3, 6],
    [2, 6],
    [1, 6],
  ])('is %i columns -> %i cards', (columns, size) => {
    expect(blockSize(columns)).toBe(size);
  });

  it('treats a nonsense column count as one column', () => {
    expect(blockSize(0)).toBe(6);
  });
});

describe('layoutFeed', () => {
  const kinds = (items: number[], size: number) =>
    layoutFeed(items, size).map((entry) => (entry.kind === 'card' ? entry.item : `rail${entry.index}`));

  it('puts a rail after each full block', () => {
    expect(kinds([1, 2, 3, 4, 5, 6], 2)).toEqual([1, 2, 'rail0', 3, 4, 'rail1', 5, 6]);
  });

  it('never ends on a rail', () => {
    expect(kinds([1, 2, 3, 4], 2)).toEqual([1, 2, 'rail0', 3, 4]);
  });

  it('adds no rail inside a block that is not full', () => {
    expect(kinds([1, 2, 3], 4)).toEqual([1, 2, 3]);
  });

  it('is empty for no cards', () => {
    expect(layoutFeed([], 4)).toEqual([]);
  });
});

describe('popularRailAt', () => {
  it('takes turns: restaurants, communities, bucket lists, experiences, then round again', () => {
    expect([0, 1, 2, 3, 4].map(popularRailAt)).toEqual([
      'restaurants',
      'communities',
      'bucketLists',
      'experiences',
      'restaurants',
    ]);
  });
});
