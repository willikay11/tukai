import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import {
  useAddBucketListItem,
  useJoinBucketList,
  useLeaveBucketList,
  useRemoveBucketListItem,
} from './useBucketLists';

jest.mock('@/services/bucket-list', () => ({
  addBucketListItem: jest.fn().mockResolvedValue({ success: true }),
  removeBucketListItem: jest.fn().mockResolvedValue({ success: true }),
  createBucketList: jest.fn(),
  deleteBucketList: jest.fn(),
  fetchBucketList: jest.fn(),
  fetchMyBucketLists: jest.fn(),
  joinBucketList: jest.fn().mockResolvedValue({ success: true }),
  leaveBucketList: jest.fn().mockResolvedValue({ success: true }),
  updateBucketList: jest.fn(),
}));

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidated: unknown[] = [];
  queryClient.invalidateQueries = jest.fn((filters) => {
    invalidated.push((filters as { queryKey: unknown[] })?.queryKey?.[0]);
    return Promise.resolve();
  }) as never;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper, invalidated };
};

describe('saving to a bucket list', () => {
  /**
   * A saved item is a bookmark, so `is_bookmarked` flips on the experience or
   * place. Leaving the card queries cached meant the basket stayed empty when
   * the reader came back to the page.
   */
  it('re-reads the cards, not just the lists', async () => {
    const { wrapper, invalidated } = setup();
    const { result } = renderHook(() => useAddBucketListItem('bl1'), { wrapper });

    result.current.mutate({ experienceId: 'exp-1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidated).toEqual(
      expect.arrayContaining([
        'bucket-list',
        'bucket-lists',
        'experiences',
        'experience',
        'places',
        'place',
      ]),
    );
  });

  it('does the same when something is taken off a list', async () => {
    const { wrapper, invalidated } = setup();
    const { result } = renderHook(() => useRemoveBucketListItem('bl1'), { wrapper });

    result.current.mutate('item-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidated).toEqual(expect.arrayContaining(['experiences', 'places']));
  });
});

describe('joining and leaving a list', () => {
  /**
   * A drawer left open on the list a reader just joined or left reads its own
   * `['bucket-list', id]` cache, not `['bucket-lists']` - without this it kept
   * showing the button for whichever side the reader had just pressed.
   */
  it('re-reads the list itself after joining, not just the collection', async () => {
    const { wrapper, invalidated } = setup();
    const { result } = renderHook(() => useJoinBucketList(), { wrapper });

    result.current.mutate('share-abc');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidated).toEqual(expect.arrayContaining(['bucket-lists', 'bucket-list']));
  });

  it('does the same after leaving', async () => {
    const { wrapper, invalidated } = setup();
    const { result } = renderHook(() => useLeaveBucketList(), { wrapper });

    result.current.mutate('bl1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidated).toEqual(expect.arrayContaining(['bucket-lists', 'bucket-list']));
  });
});
