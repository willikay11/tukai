import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';

import { useAddBucketListItem, useRemoveBucketListItem } from './useBucketLists';

jest.mock('@/services/bucket-list', () => ({
  addBucketListItem: jest.fn().mockResolvedValue({ success: true }),
  removeBucketListItem: jest.fn().mockResolvedValue({ success: true }),
  createBucketList: jest.fn(),
  deleteBucketList: jest.fn(),
  fetchBucketList: jest.fn(),
  fetchMyBucketLists: jest.fn(),
  joinBucketList: jest.fn(),
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
