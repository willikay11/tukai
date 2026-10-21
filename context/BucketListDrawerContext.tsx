'use client';

import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

import { BucketListDrawer } from '@/app/shared/components/BucketList';

type BucketListDrawerValue = {
  /** The bucket list currently open, or null. */
  openBucketListId: string | null;
  openBucketList: (bucketListId: string) => void;
  closeBucketList: () => void;
};

const BucketListDrawerContext = createContext<BucketListDrawerValue | null>(null);

/**
 * One bucket list drawer for the whole app, the same shape as the experience
 * and place drawers.
 *
 * Held in state rather than the URL, for the reason the other two give: a card
 * still carries its own href to `/bucket-lists/[id]`, so a new tab or a copied
 * link still lands on the real page.
 */
export const BucketListDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [openBucketListId, setOpenBucketListId] = useState<string | null>(null);

  const openBucketList = useCallback(
    (bucketListId: string) => setOpenBucketListId(bucketListId),
    [],
  );
  const closeBucketList = useCallback(() => setOpenBucketListId(null), []);

  const value = useMemo(
    () => ({ openBucketListId, openBucketList, closeBucketList }),
    [openBucketListId, openBucketList, closeBucketList],
  );

  return (
    <BucketListDrawerContext.Provider value={value}>
      {children}
      <BucketListDrawer
        bucketListId={openBucketListId}
        isOpen={Boolean(openBucketListId)}
        onClose={closeBucketList}
      />
    </BucketListDrawerContext.Provider>
  );
};

/**
 * Opens a bucket list over whatever the reader is looking at.
 *
 * Returns null outside the provider rather than throwing, so a card can render
 * in a test, or on a screen without a drawer, and simply keep its link.
 */
export const useBucketListDrawer = (): BucketListDrawerValue | null =>
  useContext(BucketListDrawerContext);
