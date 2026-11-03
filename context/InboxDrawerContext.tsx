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

import { useRouter } from 'next/navigation';

import { InboxDrawer, InboxTab } from '@/app/shared/components/Inbox';

type InboxDrawerValue = {
  /**
   * Opens the inbox on a tab. `returnFocusTo` is what gets focus back on
   * close - the account button, since the menu row that opened it is gone by
   * then.
   */
  openInbox: (tab: InboxTab, returnFocusTo?: HTMLElement | null) => void;
  closeInbox: () => void;
};

const InboxDrawerContext = createContext<InboxDrawerValue | null>(null);

/**
 * One inbox panel for the whole app, the same shape as the other drawers.
 *
 * The tab stays as picked while the panel is open; opening it always sets it.
 * Opening a notification with somewhere to go closes the panel and goes there.
 */
export const InboxDrawerProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<InboxTab>('notifications');
  const opener = useRef<HTMLElement | null>(null);

  const openInbox = useCallback((next: InboxTab, returnFocusTo?: HTMLElement | null) => {
    const active = typeof document === 'undefined' ? null : document.activeElement;
    opener.current =
      returnFocusTo ?? (active instanceof HTMLElement && active !== document.body ? active : null);
    setTab(next);
    setIsOpen(true);
  }, []);

  const closeInbox = useCallback(() => {
    setIsOpen(false);

    const target = opener.current;
    opener.current = null;
    // After the panel has gone, or the focus lands inside it as it leaves
    if (target?.isConnected) setTimeout(() => target.focus({ preventScroll: true }), 0);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      closeInbox();
      router.push(href);
    },
    [closeInbox, router],
  );

  const value = useMemo(() => ({ openInbox, closeInbox }), [openInbox, closeInbox]);

  return (
    <InboxDrawerContext.Provider value={value}>
      {children}
      <InboxDrawer
        isOpen={isOpen}
        tab={tab}
        onTabChange={setTab}
        onClose={closeInbox}
        onNavigate={navigate}
      />
    </InboxDrawerContext.Provider>
  );
};

/** Null outside the provider, so a menu still renders in a test. */
export const useInboxDrawer = (): InboxDrawerValue | null => useContext(InboxDrawerContext);
