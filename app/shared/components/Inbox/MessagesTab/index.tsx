'use client';

import { useId, useMemo } from 'react';

import { PhotoImage } from '@/app/shared/components/Images';
import { useMessages } from '@/app/shared/hooks/useMessages';
import { cn } from '@/lib/utils';
import { Message, MessageThread, isThreadUnread, threadPreview, toThreads } from '@/types/message';
import { inboxStamp } from '@/types/notification';

const ThreadList = ({
  labelledBy,
  threads,
  myId,
  isUnread,
  onOpen,
}: {
  labelledBy: string;
  threads: MessageThread[];
  myId: string;
  isUnread: boolean;
  onOpen: (personId: string) => void;
}) => (
  <ul aria-labelledby={labelledBy} className="-mx-6 flex flex-col">
    {threads.map((thread) => {
      const when = inboxStamp(thread.last.dateCreated);

      return (
        <li key={thread.personId}>
          <button
            type="button"
            onClick={() => onOpen(thread.personId)}
            className="flex w-full items-center gap-3.5 border-b border-surface-muted px-6 py-3.5 text-left transition-colors hover:bg-surface-row"
          >
            <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-surface-brand">
              <PhotoImage
                src={thread.person?.picture ?? undefined}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
                fallback={
                  <span className="flex h-full w-full items-center justify-center text-[17px] font-bold text-brand-ink">
                    {thread.name.charAt(0).toUpperCase()}
                  </span>
                }
              />
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex min-w-0 items-baseline gap-3">
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate text-[15.5px]',
                    isUnread ? 'font-semibold text-gray-800' : 'font-medium text-ink-muted',
                  )}
                >
                  {thread.name}
                </span>
                {when && <span className="flex-shrink-0 text-13 text-ink-muted">{when}</span>}
              </span>
              <span
                className={cn(
                  'truncate text-[14.5px]',
                  isUnread ? 'text-gray-800' : 'text-ink-muted',
                )}
              >
                {threadPreview(thread, myId)}
              </span>
            </span>
          </button>
        </li>
      );
    })}
  </ul>
);

/**
 * The reader's conversations: Unread, then Read, newest first. Opening one is
 * the caller's - the panel stacks the conversation on top of the inbox.
 *
 * The API has no threads, so they are grouped here from the one flat list of
 * every message the reader is party to.
 */
export const MessagesTab = ({
  myId,
  onOpenConversation,
}: {
  myId: string;
  onOpenConversation: (personId: string) => void;
}) => {
  const unreadId = useId();
  const readId = useId();

  const { data: response, isLoading } = useMessages();

  const payload = response?.data;

  // Read inside the memo: a fresh array every render would rebuild the threads
  // every render too
  const threads = useMemo(() => {
    const messages: Message[] = Array.isArray(payload) ? payload : (payload?.results ?? []);

    return toThreads(messages, myId);
  }, [payload, myId]);

  if (isLoading) {
    return <div aria-hidden="true" className="h-40 animate-pulse rounded-xl bg-surface" />;
  }

  if (threads.length === 0) {
    return (
      <p className="text-pretty rounded-xl bg-surface px-5 py-6 text-center text-15 leading-[1.55] text-ink">
        No messages yet. Conversations with hosts and friends show up here.
      </p>
    );
  }

  const unread = threads.filter((thread) => isThreadUnread(thread, myId));
  const read = threads.filter((thread) => !isThreadUnread(thread, myId));

  return (
    <div className="flex flex-col gap-2">
      {unread.length > 0 && (
        <>
          <h3 id={unreadId} className="text-19 font-bold tracking-[-0.2px] text-gray-800">
            Unread messages
          </h3>
          <ThreadList
            labelledBy={unreadId}
            threads={unread}
            myId={myId}
            isUnread
            onOpen={onOpenConversation}
          />
        </>
      )}

      {read.length > 0 && (
        <>
          <h3 id={readId} className="mt-5 text-19 font-bold tracking-[-0.2px] text-gray-800">
            Read messages
          </h3>
          <ThreadList
            labelledBy={readId}
            threads={read}
            myId={myId}
            isUnread={false}
            onOpen={onOpenConversation}
          />
        </>
      )}
    </div>
  );
};
