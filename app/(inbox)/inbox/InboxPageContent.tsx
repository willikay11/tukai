'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ConversationView, InboxContent, InboxTab } from '@/app/shared/components/Inbox';
import { PageContainer } from '@/app/shared/components/Layout';
import { useConversation } from '@/app/shared/hooks/useMessages';
import { Button } from '@/components/ui/button';

/**
 * The inbox as a page, for a link that lands here. The account menu opens the
 * same content in the side panel instead.
 */
export const InboxPageContent = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [tab, setTab] = useState<InboxTab>('notifications');
  const [conversationWith, setConversationWith] = useState<string | null>(null);
  const { thread } = useConversation(userId ?? undefined, conversationWith);

  if (status === 'loading') {
    return (
      <PageContainer className="py-6">
        <div className="h-8 w-40 animate-pulse rounded-full bg-gray-100" />
      </PageContainer>
    );
  }

  if (!userId) {
    return (
      <PageContainer className="py-16 text-center">
        <p className="text-sm text-gray-500">Sign in to see your inbox.</p>
        <Link href="/auth/sign-in" className="mt-4 inline-flex">
          <Button className="rounded-full px-6">Sign in</Button>
        </Link>
      </PageContainer>
    );
  }

  if (conversationWith) {
    return (
      <PageContainer className="py-6">
        {/* A frame of its own, so the composer stays pinned under the messages */}
        <div className="h-[75dvh] min-h-[420px] overflow-hidden rounded-18 border border-surface-muted bg-white">
          <ConversationView
            personId={conversationWith}
            thread={thread}
            me={{ id: userId, name: session?.user?.name, photo: session?.user?.image }}
            onBack={() => {
              setConversationWith(null);
              setTab('messages');
            }}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col gap-7 py-6">
      <h1 className="text-[24px] font-bold tracking-[-0.4px] text-gray-800">Inbox</h1>

      <InboxContent
        myId={userId}
        tab={tab}
        onTabChange={setTab}
        onOpenNotification={(href) => href && router.push(href)}
        onOpenConversation={setConversationWith}
      />
    </PageContainer>
  );
};
