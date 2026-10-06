import { FEED_MIX_DEFAULT, splitIntoRuns } from './feed-mix';

const items = (count: number) => Array.from({ length: count }, (_, index) => index);

describe('splitIntoRuns', () => {
  it('defaults to every third', () => {
    expect(FEED_MIX_DEFAULT).toBe('every-third');
  });

  it('cuts a run every third moment', () => {
    expect(splitIntoRuns(items(7), 'every-third')).toEqual([[0, 1, 2], [3, 4, 5], [6]]);
  });

  it('cuts a run every other moment', () => {
    expect(splitIntoRuns(items(5), 'every-other')).toEqual([[0, 1], [2, 3], [4]]);
  });

  it('keeps one run with no breaks for newest first', () => {
    expect(splitIntoRuns(items(7), 'newest')).toEqual([items(7)]);
  });

  it('ends on a full run when the count divides evenly', () => {
    expect(splitIntoRuns(items(6), 'every-third')).toEqual([
      [0, 1, 2],
      [3, 4, 5],
    ]);
  });

  it('returns no runs for an empty feed', () => {
    expect(splitIntoRuns([], 'every-third')).toEqual([]);
    expect(splitIntoRuns([], 'newest')).toEqual([]);
  });

  it('keeps earlier runs fixed as the feed grows', () => {
    const before = splitIntoRuns(items(4), 'every-third');
    const after = splitIntoRuns(items(8), 'every-third');

    expect(after[0]).toEqual(before[0]);
  });
});
