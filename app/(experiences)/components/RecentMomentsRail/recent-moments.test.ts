import { Moment } from '@/types/moment';

import { RAIL_FETCH_SIZE, railColumns, railStep, stackPhotos } from './recent-moments';

const moment = (id: number): Moment =>
  ({
    id: String(id),
    media: [{ id: `m${id}`, photo: `https://cdn.tukai.co/${id}.jpg`, order: 0 }],
  }) as unknown as Moment;

const moments = (count: number) => Array.from({ length: count }, (_, index) => moment(index));

describe('railColumns', () => {
  it('pairs moments in feed order', () => {
    const columns = railColumns(moments(4));

    expect(columns.map((column) => column.map((tile) => tile.moment.id))).toEqual([
      ['0', '1'],
      ['2', '3'],
    ]);
  });

  // Short on top in the first, third, fifth column, so the gap zigzags
  it('swaps the short tile from end to end', () => {
    const columns = railColumns(moments(6));

    expect(columns.map((column) => column.map((tile) => tile.grow))).toEqual([
      [2, 3],
      [3, 2],
      [2, 3],
    ]);
  });

  it('drops a lone moment rather than draw half a column', () => {
    expect(railColumns(moments(3))).toHaveLength(1);
    expect(railColumns(moments(1))).toHaveLength(0);
  });

  it('stops at twenty columns', () => {
    expect(railColumns(moments(RAIL_FETCH_SIZE))).toHaveLength(20);
  });
});

describe('stackPhotos', () => {
  it('peeks at the three moments after the last tile', () => {
    expect(stackPhotos(moments(7), 2)).toEqual([
      'https://cdn.tukai.co/4.jpg',
      'https://cdn.tukai.co/5.jpg',
      'https://cdn.tukai.co/6.jpg',
    ]);
  });

  it('falls back to the first three when there are not three more', () => {
    expect(stackPhotos(moments(5), 2)).toEqual([
      'https://cdn.tukai.co/0.jpg',
      'https://cdn.tukai.co/1.jpg',
      'https://cdn.tukai.co/2.jpg',
    ]);
  });
});

describe('railStep', () => {
  it('scrolls by as many whole columns as fit', () => {
    expect(railStep(1000)).toBe(945);
  });

  it('scrolls at least one column', () => {
    expect(railStep(80)).toBe(135);
  });
});
