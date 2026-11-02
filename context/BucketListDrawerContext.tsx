'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  BucketListDrawer,
  BucketListNav,
  BucketListScreen,
} from '@/app/shared/components/BucketList/BucketListDrawer';
import { withoutList } from '@/app/shared/components/BucketList/BucketListDrawer/bucket-list-drawer';

type BucketListDrawerValue = {
  /** The list at the bottom of the panel, or null. */
  openBucketListId: string | null;
  /** Opens a list as a new panel, replacing anything in it. */
  openBucketList: (bucketListId: string) => void;
  /** Opens a screen on top of what is open, or as a new panel if nothing is. */
  pushScreen: (screen: BucketListScreen) => void;
  /** Create bucket list, as a new panel. */
  openCreateBucketList: () => void;
  closeBucketList: () => void;
};

const BucketListDrawerContext = createContext<BucketListDrawerValue | null>(null);

/**
 * One bucket list panel for the whole app, the same shape as the experience
 * and place drawers.
 *
 * The panel is a stack of screens - a list, with Members, Invite members or
 * Edit opened on top and Back taking them off. Held in state rather than the
 * URL, for the reason the other drawers give: a card still carries its own
 * href to `/bucket-lists/[id]`, so a new tab or a copied link still lands on
 * the real page.
 *
 * Whatever had focus when the panel opened - usually the card - gets it back
 * when the panel closes.
 */
export const BucketListDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [stack, setStack] = useState<BucketListScreen[]>([]);
  const opener = useRef<HTMLElement | null>(null);

  const rememberOpener = useCallback(() => {
    if (typeof document === 'undefined') return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) opener.current = active;
  }, []);

  const restoreFocus = useCallback(() => {
    const target = opener.current;
    opener.current = null;
    // After the panel has gone, or the focus lands inside it as it leaves
    if (target?.isConnected) setTimeout(() => target.focus({ preventScroll: true }), 0);
  }, []);

  const openBucketList = useCallback(
    (bucketListId: string) => {
      rememberOpener();
      setStack([{ kind: 'list', id: bucketListId }]);
    },
    [rememberOpener],
  );

  const pushScreen = useCallback(
    (screen: BucketListScreen) =>
      setStack((current) => {
        if (current.length === 0) rememberOpener();
        return [...current, screen];
      }),
    [rememberOpener],
  );

  const openCreateBucketList = useCallback(() => {
    rememberOpener();
    setStack([{ kind: 'create' }]);
  }, [rememberOpener]);

  const closeBucketList = useCallback(() => {
    setStack([]);
    restoreFocus();
  }, [restoreFocus]);

  const nav: BucketListNav = useMemo(
    () => ({
      push: (screen) => setStack((current) => [...current, screen]),
      replace: (screen) => setStack((current) => [...current.slice(0, -1), screen]),
      back: () => {
        if (stack.length <= 1) closeBucketList();
        else setStack((current) => current.slice(0, -1));
      },
      closeList: (bucketListId) => {
        const next = withoutList(stack, bucketListId);
        if (next.length === 0) closeBucketList();
        else setStack(next);
      },
      close: closeBucketList,
      canGoBack: stack.length > 1,
    }),
    [stack, closeBucketList],
  );

  const bottom = stack[0];
  const openBucketListId = bottom && 'id' in bottom ? bottom.id : null;

  const value = useMemo(
    () => ({
      openBucketListId,
      openBucketList,
      pushScreen,
      openCreateBucketList,
      closeBucketList,
    }),
    [openBucketListId, openBucketList, pushScreen, openCreateBucketList, closeBucketList],
  );

  return (
    <BucketListDrawerContext.Provider value={value}>
      {children}
      <BucketListDrawer stack={stack} isOpen={stack.length > 0} nav={nav} />
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
