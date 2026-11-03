'use client';

import { useEffect, useRef, useState } from 'react';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useSendMessageTo } from '@/app/shared/hooks/useMessages';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageThread, isMine } from '@/types/message';

/**
 * One conversation, read oldest first, with the composer under it.
 *
 * Sending goes through the same hook as the dialog on a host's page, so the two
 * cannot drift apart.
 */
export const ConversationView = ({
  thread,
  myId,
  onBack,
}: {
  thread: MessageThread;
  myId: string;
  onBack: () => void;
}) => {
  const { toast } = useToast();
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const { mutate: send, isPending } = useSendMessageTo();

  // A conversation opens at its newest message, as every messenger does
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [thread.messages.length]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const content = draft.trim();
    if (!content) return;

    send(
      { content, recipientId: thread.personId },
      {
        onSuccess: (response) => {
          // The service reports a refusal in its own result rather than throwing
          if (response?.success === false) {
            toast({
              title: 'Message not sent',
              description: response.message ?? 'Please try again.',
              variant: 'destructive',
            });
            return;
          }

          setDraft('');
        },
        onError: (error: Error) =>
          toast({
            title: 'Message not sent',
            description: error.message,
            variant: 'destructive',
          }),
      },
    );
  };

  return (
    <div className="flex h-[60vh] min-h-[420px] flex-col rounded-2xl border border-gray-100 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to messages"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface"
        >
          <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
        </button>

        <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-surface-brand">
          <PhotoImage
            src={thread.person?.picture ?? undefined}
            alt={thread.name}
            fill
            sizes="36px"
            className="object-cover"
            fallback={
              <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-ink">
                {thread.name.charAt(0).toUpperCase()}
              </span>
            }
          />
        </div>

        <p className="min-w-0 flex-1 truncate text-sm font-bold text-gray-900">{thread.name}</p>
      </div>

      <div data-panel-body className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {thread.messages.map((message) => {
          const mine = isMine(message, myId);

          return (
            <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] rounded-18 px-4 py-2.5',
                  mine ? 'bg-surface-brand text-brand-ink' : 'bg-surface text-gray-900',
                )}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                {message.dateCreated && (
                  <p className="mt-1 text-13 text-ink-subtle">
                    {moment(message.dateCreated).format('D MMM, h:mm A')}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-gray-100 p-3">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          aria-label={`Message ${thread.name}`}
          placeholder="Write a message"
          className="h-11 min-w-0 flex-1 rounded-full border border-line bg-white px-4 text-sm text-gray-900 outline-none focus:border-brand"
        />
        <Button
          type="submit"
          variant="lime"
          isLoading={isPending}
          disabled={!draft.trim()}
          className="flex-shrink-0 rounded-full px-5"
        >
          Send
        </Button>
      </form>
    </div>
  );
};
