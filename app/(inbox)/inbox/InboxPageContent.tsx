'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import { useUnreadNotificationCount } from '@/app/shared/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { unreadBadge } from '@/types/notification';

import { NotificationsTab } from './components/NotificationsTab';

type InboxTab = 'notifications' | 'messages';

/**
 * The inbox the profile menu pointed at nothing.
 *
 * Two tabs, as the canvas has it. Messages are not built yet, so that tab says
 * so rather than being hidden — the canvas puts them side by side and a reader
 * who came looking for messages should find out where they will be.
 */
export const InboxPageContent = () => {
  const { data: session, status } = useSession();
  const isSignedIn = Boolean(session?.user?.id);
  const [tab, setTab] = useState<InboxTab>('notifications');

  const { data: countResponse } = useUnreadNotificationCount(isSignedIn);
  const badge = unreadBadge(Number(countResponse?.data?.count ?? 0));

  if (status === 'loading') {
    return (
      <PageContainer className="py-6">
        <div className="h-8 w-40 animate-pulse rounded-full bg-gray-100" />
      </PageContainer>
    );
  }

  if (!isSignedIn) {
    return (
      <PageContainer className="py-16 text-center">
        <p className="text-sm text-gray-500">Sign in to see your inbox.</p>
        <Link href="/auth/sign-in" className="mt-4 inline-flex">
          <Button className="rounded-full px-6">Sign in</Button>
        </Link>
      </PageContainer>
    );
  }

  const tabs: Array<{ id: InboxTab; label: string; badge?: string | null }> = [
    { id: 'notifications', label: 'Notifications', badge },
    { id: 'messages', label: 'Messages' },
  ];

  return (
    <PageContainer className="space-y-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900">Inbox</h1>

      <div
        role="tablist"
        aria-label="Inbox"
        className="inline-flex items-center gap-1 rounded-full bg-surface p-1"
      >
        {tabs.map((option) => {
          const isActive = tab === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(option.id)}
              className={cn(
                'flex h-11 items-center gap-2 rounded-full px-[18px] text-15 font-medium transition-colors',
                isActive ? 'bg-emerald-200 text-brand-deep' : 'text-gray-900 hover:bg-white/60',
              )}
            >
              {option.label}
              {option.badge && (
                <span className="rounded-full bg-danger px-1.5 text-13 font-semibold text-white">
                  {option.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === 'notifications' ? (
        <NotificationsTab />
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface py-16 text-center">
          <IconComponent
            iconName="BubbleChatIcon"
            size={28}
            color="currentColor"
            className="text-ink-subtle"
          />
          <p className="text-sm text-ink">Messages are not here yet.</p>
          <p className="text-13 text-ink-muted">
            You can still message a host from their experience.
          </p>
        </div>
      )}
    </PageContainer>
  );
};
