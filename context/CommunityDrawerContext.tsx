'use client';

import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

import { CommunityDrawer } from '@/app/shared/components/Communities';

type CommunityDrawerValue = {
  /** The community currently open, or null. */
  openCommunityId: string | null;
  openCommunity: (communityId: string) => void;
  closeCommunity: () => void;
};

const CommunityDrawerContext = createContext<CommunityDrawerValue | null>(null);

/**
 * One community drawer for the whole app, the same shape as the experience,
 * place and bucket-list drawers.
 *
 * Held in state rather than the URL: a card still carries its own href to
 * `/communities/[id]`, so a new tab or a copied link still lands on the full
 * page.
 */
export const CommunityDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [openCommunityId, setOpenCommunityId] = useState<string | null>(null);

  const openCommunity = useCallback((communityId: string) => setOpenCommunityId(communityId), []);
  const closeCommunity = useCallback(() => setOpenCommunityId(null), []);

  const value = useMemo(
    () => ({ openCommunityId, openCommunity, closeCommunity }),
    [openCommunityId, openCommunity, closeCommunity],
  );

  return (
    <CommunityDrawerContext.Provider value={value}>
      {children}
      <CommunityDrawer
        communityId={openCommunityId}
        isOpen={Boolean(openCommunityId)}
        onClose={closeCommunity}
      />
    </CommunityDrawerContext.Provider>
  );
};

/**
 * Opens a community over whatever the reader is looking at.
 *
 * Returns null outside the provider rather than throwing, so a caller can
 * render in a test, or on a screen without a drawer, and fall back to its own
 * link.
 */
export const useCommunityDrawer = (): CommunityDrawerValue | null =>
  useContext(CommunityDrawerContext);
