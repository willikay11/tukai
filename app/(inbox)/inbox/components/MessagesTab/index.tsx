'use client';

import { useEffect, useMemo, useState } from 'react';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useMarkMessageRead, useMessages } from '@/app/shared/hooks/useMessages';
import { NoData } from '@/components/ui/noData';
import { cn } from '@/lib/utils';
import { Message, isMine, matchesThread, threadPreview, toThreads } from '@/types/message';

import { ConversationView } from '../ConversationView';

/**
 * The reader's conversations.
 *
 * The API has no threads, so they are grouped here from the one flat list of
 * every message the reader is party to.
 */
export const MessagesTab = ({ myId }: { myId: string }) => {
  const [openPersonId, setOpenPersonId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const { data: response, isLoading } = useMessages();
  const { mutate: markRead } = useMarkMessageRead();

  const payload = response?.data;
  const messages: Message[] = Array.isArray(payload) ? payload : (payload?.results ?? []);

  const threads = useMemo(() => toThreads(messages, myId), [messages, myId]);
  const open = threads.find((thread) => thread.personId === openPersonId) ?? null;

  // Opening a conversation is reading it, so what was sent to the reader stops
  // being unread
  useEffect(() => {
    if (!open) return;

    open.messages
      .filter((message) => !message.isRead && !isMine(message, myId))
      .forEach((message) => markRead(message.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open?.personId, open?.messages.length]);

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />;
  }

  if (open) {
    return <ConversationView thread={open} myId={myId} onBack={() => setOpenPersonId(null)} />;
  }

  if (threads.length === 0) {
    return (
      <div className="py-12">
        <NoData message="No messages yet" />
      </div>
    );
  }

  const visible = threads.filter((thread) => matchesThread(thread, query));

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search messages"
        placeholder="Search by name or what was said"
        className="h-12 w-full rounded-14 border border-line bg-white px-4 text-15 text-gray-900 outline-none focus:border-brand"
      />

      {visible.length === 0 ? (
        <p className="rounded-14 bg-surface px-5 py-6 text-center text-15 text-ink">
          No one matches that search.
        </p>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white">
          {visible.map((thread) => (
            <button
              key={thread.personId}
              type="button"
              onClick={() => setOpenPersonId(thread.personId)}
              className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-surface/60"
            >
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-surface-brand">
                <PhotoImage
                  src={thread.person?.picture ?? undefined}
                  alt={thread.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                  fallback={
                    <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-ink">
                      {thread.name.charAt(0).toUpperCase()}
                    </span>
                  }
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'truncate text-sm text-gray-900',
                    thread.unreadCount > 0 ? 'font-bold' : 'font-semibold',
                  )}
                >
                  {thread.name}
                </p>
                <p
                  className={cn(
                    'truncate text-13',
                    thread.unreadCount > 0 ? 'text-gray-900' : 'text-ink-muted',
                  )}
                >
                  {threadPreview(thread, myId)}
                </p>
              </div>

              <div className="flex flex-shrink-0 flex-col items-end gap-1">
                {thread.last.dateCreated && (
                  <span className="text-13 text-ink-subtle">
                    {moment(thread.last.dateCreated).fromNow(true)}
                  </span>
                )}
                {thread.unreadCount > 0 && (
                  <span className="rounded-full bg-danger px-1.5 text-13 font-semibold text-white">
                    {thread.unreadCount}
                  </span>
                )}
              </div>

              <IconComponent
                iconName="ArrowRight01Icon"
                size={18}
                color="currentColor"
                className="flex-shrink-0 text-ink-subtle"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
