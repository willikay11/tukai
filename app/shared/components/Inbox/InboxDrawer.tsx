'use client';

import { useRef } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useConversation } from '@/app/shared/hooks/useMessages';
import { Drawer } from '@/components/ui/drawer';

import { ConversationView } from './ConversationView';
import { InboxContent, InboxTab } from './InboxContent';

/**
 * The inbox, in the shared side panel: title, Close, the two tabs, and no
 * footer. Opened from the account menu through `useInboxDrawer`.
 *
 * A conversation opened from Messages stacks on top of it, so its header
 * carries Back, which returns here on Messages. Close closes the lot.
 */
export const InboxDrawer = ({
  isOpen,
  tab,
  conversationWith,
  onTabChange,
  onOpenConversation,
  onBack,
  onClose,
  onNavigate,
}: {
  isOpen: boolean;
  tab: InboxTab;
  /** The person whose conversation is open on top, or null for the inbox. */
  conversationWith: string | null;
  onTabChange: (tab: InboxTab) => void;
  onOpenConversation: (personId: string) => void;
  onBack: () => void;
  onClose: () => void;
  onNavigate: (href: string) => void;
}) => {
  const { data: session } = useSession();
  const myId = session?.user?.id;
  const panelRef = useRef<HTMLDivElement>(null);

  const { thread } = useConversation(myId ?? undefined, isOpen ? conversationWith : null);

  // Switching tabs starts the panel from the top
  const changeTab = (next: InboxTab) => {
    onTabChange(next);
    panelRef.current?.scrollTo({ top: 0 });
  };

  const isConversation = Boolean(myId && conversationWith);

  return (
    <Drawer
      isOpen={isOpen && Boolean(myId)}
      setIsOpen={(open) => !open && onClose()}
      panelRef={panelRef}
      ariaLabel={isConversation ? (thread?.name ?? 'Conversation') : 'Inbox'}
    >
      {myId && conversationWith ? (
        <ConversationView
          personId={conversationWith}
          thread={thread}
          me={{ id: myId, name: session?.user?.name, photo: session?.user?.image }}
          onBack={onBack}
          onClose={onClose}
        />
      ) : (
        <div className="flex min-h-full flex-col">
          {/* Stays put while the panel scrolls, as the panel's own header does */}
          <div className="sticky top-0 z-10 flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted bg-white px-4">
            <h2 className="min-w-0 flex-1 truncate px-1.5 text-[24px] font-bold tracking-[-0.4px] text-gray-800">
              Inbox
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-danger transition-colors hover:bg-danger-surface"
            >
              <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-0 px-6 pb-9 pt-5">
            {myId && (
              <InboxContent
                myId={myId}
                tab={tab}
                onTabChange={changeTab}
                onOpenNotification={(href) => href && onNavigate(href)}
                onOpenConversation={onOpenConversation}
                autoFocus
              />
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
};
