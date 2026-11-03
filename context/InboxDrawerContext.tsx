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
 * Opening a conversation stacks it on top, and Back returns to Messages.
 */
export const InboxDrawerProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<InboxTab>('notifications');
  const [conversationWith, setConversationWith] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const openInbox = useCallback((next: InboxTab, returnFocusTo?: HTMLElement | null) => {
    const active = typeof document === 'undefined' ? null : document.activeElement;
    opener.current =
      returnFocusTo ?? (active instanceof HTMLElement && active !== document.body ? active : null);
    setTab(next);
    setConversationWith(null);
    setIsOpen(true);
  }, []);

  const backToMessages = useCallback(() => {
    setConversationWith(null);
    setTab('messages');
  }, []);

  const closeInbox = useCallback(() => {
    // The conversation is left in place so the panel does not flash back to
    // the inbox as it slides away; opening the inbox clears it
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
        conversationWith={conversationWith}
        onTabChange={setTab}
        onOpenConversation={setConversationWith}
        onBack={backToMessages}
        onClose={closeInbox}
        onNavigate={navigate}
      />
    </InboxDrawerContext.Provider>
  );
};

/** Null outside the provider, so a menu still renders in a test. */
export const useInboxDrawer = (): InboxDrawerValue | null => useContext(InboxDrawerContext);
