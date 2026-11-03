'use client';

import { KeyboardEvent, useEffect, useRef, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import {
  useDeleteConversation,
  useMarkMessageRead,
  useSendMessageTo,
} from '@/app/shared/hooks/useMessages';
import { useToast } from '@/app/shared/hooks/useToast';
import { cn } from '@/lib/utils';
import { MessageThread, isMine, toConversationRows } from '@/types/message';

import { DeleteConversationDialog } from './DeleteConversationDialog';

type Me = { id: string; name?: string | null; photo?: string | null };

const headerButton =
  'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface transition-colors';

const Avatar = ({ photo, name }: { photo?: string | null; name: string }) => (
  <span className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-surface-brand">
    <PhotoImage
      src={photo ?? undefined}
      alt=""
      fill
      sizes="36px"
      className="object-cover"
      fallback={
        <span className="flex h-full w-full items-center justify-center text-13 font-bold text-brand-ink">
          {name.charAt(0).toUpperCase()}
        </span>
      }
    />
  </span>
);

/**
 * One conversation, as its own screen in the side panel: Back, the person's
 * name, Delete conversation and Close, the messages oldest first, and the
 * composer pinned under them in place of a footer.
 *
 * Opening it reads it, and so does anything new that arrives while it is open.
 * `onClose` is left out where there is no panel to close.
 */
export const ConversationView = ({
  personId,
  thread,
  me,
  onBack,
  onClose,
}: {
  personId: string;
  thread: MessageThread | null;
  me: Me;
  onBack: () => void;
  onClose?: () => void;
}) => {
  const { toast } = useToast();
  const [draft, setDraft] = useState('');
  const [isAskingToDelete, setIsAskingToDelete] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const deleteRef = useRef<HTMLButtonElement>(null);

  // The row that opened this is gone, so focus starts on Back
  useEffect(() => {
    backRef.current?.focus({ preventScroll: true });
  }, []);

  const { mutate: send } = useSendMessageTo();
  const { mutate: markRead } = useMarkMessageRead();
  const { mutate: remove } = useDeleteConversation();

  const name = thread?.name ?? 'Conversation';
  const messages = thread?.messages ?? [];
  const rows = toConversationRows(messages, me.id);
  const canSend = Boolean(draft.trim());

  // Opens at the newest message, and follows each new one down
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [messages.length]);

  // Opening a conversation is reading it, and so is anything that arrives
  // while it is open
  useEffect(() => {
    messages
      .filter((message) => !message.isRead && !isMine(message, me.id))
      .forEach((message) => markRead(message.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId, messages.length]);

  const submit = () => {
    const content = draft.trim();
    if (!content) return;

    // Shown and cleared at once; put back if it does not go
    setDraft('');
    send(
      { content, recipientId: personId, senderId: me.id },
      {
        onError: (error: Error) => {
          setDraft((current) => current || content);
          toast({ title: 'Message not sent', description: error.message, variant: 'destructive' });
        },
      },
    );
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Not while a word is still being composed with an input method
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    submit();
  };

  const cancelDelete = () => {
    setIsAskingToDelete(false);
    deleteRef.current?.focus();
  };

  const confirmDelete = () => {
    setIsAskingToDelete(false);
    remove(
      { senderId: me.id, recipientId: personId },
      {
        onError: (error: Error) =>
          toast({
            title: 'Could not delete this conversation',
            description: error.message,
            variant: 'destructive',
          }),
      },
    );
    onBack();
    toast({ title: 'Conversation deleted.' });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted px-4">
        <button
          ref={backRef}
          type="button"
          onClick={onBack}
          aria-label="Back"
          className={`${headerButton} text-brand hover:bg-surface-brand`}
        >
          <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
        </button>

        <h2 className="min-w-0 flex-1 truncate px-1.5 text-[24px] font-bold tracking-[-0.4px] text-gray-800">
          {name}
        </h2>

        {thread && (
          <button
            ref={deleteRef}
            type="button"
            onClick={() => setIsAskingToDelete(true)}
            aria-label="Delete conversation"
            className={`${headerButton} text-danger hover:bg-danger-surface`}
          >
            <IconComponent iconName="Delete02Icon" size={20} color="currentColor" />
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`${headerButton} text-danger hover:bg-danger-surface`}
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        )}
      </div>

      <div
        ref={bodyRef}
        data-panel-body
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-9 pt-5"
      >
        <div role="log" aria-label={`Messages with ${name}`} className="-mt-2 flex flex-col">
          {rows.map((row) => {
            if (row.kind === 'break') {
              return (
                <div key={row.key} className="pb-1 pt-3.5 text-center text-sm text-ink-muted">
                  {row.label}
                </div>
              );
            }

            const who = row.mine ? 'You' : name;

            return (
              <div key={row.key}>
                {row.divided && <div aria-hidden="true" className="-mx-6 h-px bg-surface-muted" />}
                {/* Every message looks the same: left-aligned, with the sender's photo */}
                <div className="flex items-start gap-3 py-3.5">
                  <Avatar
                    photo={row.mine ? me.photo : thread?.person?.picture}
                    name={row.mine ? (me.name ?? 'You') : name}
                  />
                  <p className="min-w-0 flex-1 text-pretty pt-1.5 text-[15.5px] leading-[1.55] text-gray-800 [overflow-wrap:anywhere]">
                    <span className="sr-only">{who}: </span>
                    {row.message.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-surface-muted bg-white px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3.5">
        <div className="relative">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Write a message"
            placeholder="Write a message..."
            autoComplete="off"
            className="h-14 w-full rounded-xl border border-line bg-white pl-4 pr-[60px] text-15 text-gray-800 outline-none focus:border-brand focus:shadow-[0_0_0_3px_theme(colors.surface.brand)]"
          />
          {/* Stays focusable when there is nothing to send; pressing it then does nothing */}
          <button
            type="button"
            onClick={submit}
            aria-label="Send message"
            aria-disabled={!canSend}
            className={cn(
              'absolute right-1.5 top-1.5 flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-surface-brand',
              canSend ? 'text-brand' : 'text-ink-subtle',
            )}
          >
            <IconComponent iconName="SentIcon" size={22} color="currentColor" />
          </button>
        </div>
      </div>

      {isAskingToDelete && (
        <DeleteConversationDialog name={name} onConfirm={confirmDelete} onCancel={cancelDelete} />
      )}
    </div>
  );
};
