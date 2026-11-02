'use client';

import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

import { CommunityDrawer } from '@/app/shared/components/Communities';

export type OpenCommunityOptions = {
  /**
   * Opens the community on top of another drawer - an experience's host, a
   * place's owner - rather than in place of it. The community gets a Back
   * button, which closes just it and shows the drawer below again; Close runs
   * this as well, so the whole stack goes.
   */
  onCloseBelow?: () => void;
};

type CommunityDrawerValue = {
  /** The community currently open, or null. */
  openCommunityId: string | null;
  openCommunity: (communityId: string, options?: OpenCommunityOptions) => void;
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
 *
 * Each drawer portals its own panel, and the last one opened sits on top - so
 * "stacking" a community over an experience is just opening it while the
 * experience stays open, and Back is closing the community alone.
 */
export const CommunityDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [openCommunityId, setOpenCommunityId] = useState<string | null>(null);
  // A function in state has to be wrapped, or React calls it as an updater
  const [closeBelow, setCloseBelow] = useState<{ run: () => void } | null>(null);

  const openCommunity = useCallback((communityId: string, options?: OpenCommunityOptions) => {
    setOpenCommunityId(communityId);
    setCloseBelow(options?.onCloseBelow ? { run: options.onCloseBelow } : null);
  }, []);

  const closeCommunity = useCallback(() => setOpenCommunityId(null), []);

  const closeAll = useCallback(() => {
    closeBelow?.run();
    setOpenCommunityId(null);
  }, [closeBelow]);

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
        onClose={closeAll}
        onBack={closeBelow ? closeCommunity : undefined}
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
