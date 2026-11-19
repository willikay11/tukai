'use client';

import { useMemo, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PlainImage } from '@/app/shared/components/Images';
import { Drawer } from '@/components/ui/drawer';
import { useTukai } from '@/context/TukaiContext';
import { cn } from '@/lib/utils';
import type { TukaiChat, TukaiConversation } from '@/types/tukai';
import { countUserMessages, freeMessagesText, plural } from '@/utils/tukai';
import { chatDayLabel, conversationSubtitle } from '@/utils/tukai-saved-chats';

import { useTukaiConversations } from '../hooks/useTukaiConversations';

const SectionHead = ({ title }: { title: string }) => (
  <div className="sticky top-0 z-[1] -mx-6 flex min-h-11 items-center bg-surface-sticky px-6 py-2">
    <h3 className="m-0 text-[15px] font-bold text-brand-ink">{title}</h3>
  </div>
);

type ChatRow = {
  key: string;
  /** The chat's id in this browser, and the agent's session id */
  chatId: string;
  /** Set for a chat the server saved */
  conversation?: TukaiConversation;
  title: string;
  subtitle: string;
  lastAt: number;
};

const lastActivity = (chat: TukaiChat) =>
  new Date(chat.messages[chat.messages.length - 1]?.createdAt ?? chat.createdAt).getTime();

/**
 * "Your chats": search, the chats that made a plan, every chat, and the plan
 * card at the bottom. Opening a row closes the drawer.
 *
 * The list is the server's (DEV-474), so chats from every device show, with
 * "6 messages · Yesterday" or "Plan · 4 stops · Tue 10 Nov" under each, and
 * search runs on the server over titles and what was said (DEV-475). A chat
 * only this browser has - from before the server saved chats - is listed too.
 */
export const TukaiChatsDrawer = () => {
  const {
    isHistoryOpen,
    setHistoryOpen,
    currentChat,
    view,
    chats,
    openChat,
    openSavedChat,
    openingChatId,
    deleteChat,
    showOnMap,
    access,
    isUnlocked,
    freeMessagesLeft,
    showPaywall,
  } = useTukai();
  const [query, setQuery] = useState('');
  const close = () => setHistoryOpen(false);
  const q = query.trim().toLowerCase();

  const { conversations, isLoading, isError, hasMore, isLoadingMore, loadMore } =
    useTukaiConversations(query, isHistoryOpen);

  const rows: ChatRow[] = useMemo(() => {
    const saved = new Set(conversations.map((c) => c.sessionId));
    const fromServer = conversations.map((conversation) => ({
      key: conversation.id,
      chatId: conversation.sessionId,
      conversation,
      title: conversation.title,
      subtitle: conversationSubtitle(conversation),
      lastAt: new Date(conversation.lastMessageAt).getTime(),
    }));
    // Only this browser has these: kept, so nothing disappears from the list
    const onlyHere = chats
      .filter((chat) => !saved.has(chat.id))
      .filter(
        (chat) =>
          !q ||
          chat.title.toLowerCase().includes(q) ||
          chat.messages.some((m) => m.text.toLowerCase().includes(q)),
      )
      .map((chat) => ({
        key: `local-${chat.id}`,
        chatId: chat.id,
        title: chat.title,
        subtitle: [
          plural(countUserMessages(chat.messages), 'message'),
          chatDayLabel(new Date(lastActivity(chat)).toISOString()),
        ]
          .filter(Boolean)
          .join(' · '),
        lastAt: lastActivity(chat),
      }));
    // While a search is out, the server's list is still for the old one:
    // a chat on this device that's only just been saved isn't doubled
    return [...fromServer, ...onlyHere].sort((a, b) => b.lastAt - a.lastAt);
  }, [chats, conversations, q]);

  const plans = rows.filter((row) => row.conversation?.kind === 'plan');

  const open = async (row: ChatRow, withMap = false) => {
    close();
    if (row.conversation) {
      const opened = await openSavedChat(row.conversation);
      if (!opened || !withMap) return;
    } else {
      openChat(row.chatId);
      if (!withMap) return;
    }
    // The plan's places on the map, when this browser has the plan
    const local = chats.find((chat) => chat.id === row.chatId);
    const planMessage = local && [...local.messages].reverse().find((m) => m.plan);
    if (planMessage) showOnMap(planMessage.id);
  };

  const planImage = (row: ChatRow) => {
    const local = chats.find((chat) => chat.id === row.chatId);
    const message = local && [...local.messages].reverse().find((m) => m.plan);
    const first = message?.plan?.days[0]?.stops[0];
    return first ? message?.items?.[first.id]?.photos[0] : undefined;
  };

  const isCurrent = (id: string) => view === 'chat' && currentChat?.id === id;

  const renews = access.renewsAt
    ? new Date(access.renewsAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;
  const planCard = isUnlocked
    ? access.plan === 'business'
      ? {
          title: 'Included in Business',
          line: 'Unlimited chats and writing help in forms, as part of your hosting plan.',
        }
      : {
          title: 'TukAI plan',
          line: `Unlimited chats and writing help in forms.${renews ? ` Renews on ${renews}.` : ''}`,
        }
    : {
        title: freeMessagesText(freeMessagesLeft),
        line: 'Free messages reset at the start of each month. Get TukAI for unlimited messages and writing help in forms.',
      };

  return (
    <Drawer isOpen={isHistoryOpen} setIsOpen={(open) => !open && close()} ariaLabel="Your chats">
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted bg-white px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-[24px] font-bold tracking-[-0.4px] text-gray-800">
            Your chats
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-danger transition-colors hover:bg-danger-surface"
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-[18px] px-6 pb-6 pt-5">
          <div className="flex h-[52px] items-center gap-2.5 rounded-full bg-surface pl-[18px] pr-1.5">
            <IconComponent
              iconName="Search01Icon"
              size={18}
              color="currentColor"
              className="flex-shrink-0 text-ink-muted"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              aria-label="Search chats"
              autoComplete="off"
              className="min-w-0 flex-1 border-0 bg-transparent text-[14.5px] text-gray-800 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear the search"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-white"
              >
                <IconComponent iconName="Cancel01Icon" size={18} color="currentColor" />
              </button>
            )}
          </div>

          {plans.length > 0 && (
            <section aria-label="Plans" className="flex flex-col">
              <SectionHead title="Plans" />
              <div className="flex flex-col pt-1.5">
                {plans.map((row) => {
                  const img = planImage(row);
                  return (
                    <button
                      key={row.key}
                      type="button"
                      onClick={() => void open(row, true)}
                      className={cn(
                        '-mx-3 flex w-[calc(100%+24px)] items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface',
                        isCurrent(row.chatId) && 'bg-surface-brand',
                      )}
                    >
                      {img ? (
                        <PlainImage
                          src={img}
                          alt=""
                          className="block h-14 w-14 flex-shrink-0 rounded-xl bg-surface-brand object-cover"
                        />
                      ) : (
                        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-surface-brand text-brand">
                          <IconComponent iconName="Route01Icon" size={22} color="currentColor" />
                        </span>
                      )}
                      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                        <span className="truncate text-[14.5px] font-semibold leading-[1.35] text-gray-800">
                          {row.conversation?.plan?.title || row.title}
                        </span>
                        <span className="text-[13px] text-ink-muted">{row.subtitle}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {rows.length > 0 && (
            <section aria-label="Chats" className="flex flex-col">
              <SectionHead title="Chats" />
              <div className="flex flex-col pt-1.5">
                {rows.map((row) => (
                  <div
                    key={row.key}
                    className={cn(
                      '-mx-3 flex items-center gap-1 rounded-xl hover:bg-surface',
                      isCurrent(row.chatId) && 'bg-surface-brand',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => void open(row)}
                      aria-current={isCurrent(row.chatId)}
                      aria-busy={openingChatId === row.conversation?.id}
                      className="flex min-h-[60px] min-w-0 flex-1 items-center gap-3 py-2 pl-3 pr-1 text-left"
                    >
                      <IconComponent
                        iconName={
                          row.conversation?.kind === 'plan' ? 'Route01Icon' : 'BubbleChatIcon'
                        }
                        size={20}
                        color="currentColor"
                        className="flex-shrink-0 text-ink-muted"
                      />
                      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                        <span className="truncate text-[14.5px] font-semibold leading-[1.35] text-gray-800">
                          {row.title}
                        </span>
                        <span className="text-[13px] text-ink-muted">{row.subtitle}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteChat(row.chatId, row.conversation?.id)}
                      aria-label={`Delete chat: ${row.title}`}
                      className="mr-1.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-danger-surface hover:text-danger"
                    >
                      <IconComponent iconName="Delete02Icon" size={18} color="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex min-h-11 items-center self-start rounded-full bg-surface px-[18px] text-[14.5px] font-semibold text-brand-ink hover:bg-surface-brand disabled:opacity-60"
            >
              {isLoadingMore ? 'Loading…' : 'Show more chats'}
            </button>
          )}

          {isLoading && rows.length === 0 && (
            <div aria-label="Loading your chats" className="flex flex-col gap-2">
              {[0, 1, 2].map((n) => (
                <span key={n} className="block h-[60px] animate-pulse rounded-xl bg-surface" />
              ))}
            </div>
          )}

          {!isLoading && rows.length === 0 && (
            <p className="m-0 text-pretty text-[15px] leading-normal text-ink-muted">
              {isError
                ? 'Your chats could not be loaded just now. Try again in a moment.'
                : q
                  ? `No chats match “${query.trim()}”.`
                  : 'No chats yet. Ask TukAI anything to start one.'}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 flex-shrink-0 border-t border-surface-muted bg-white px-6 pb-[calc(16px+var(--drawer-inset-bottom,env(safe-area-inset-bottom)))] pt-4">
          <div
            className={cn(
              'flex flex-col gap-1 rounded-xl px-4 py-3.5',
              isUnlocked ? 'bg-surface-brand' : 'bg-lime-soft',
            )}
          >
            <span className="text-[14.5px] font-bold text-brand-ink">{planCard.title}</span>
            <span className="text-pretty text-[13px] leading-[1.45] text-ink-note">
              {planCard.line}
            </span>
            {!isUnlocked && (
              <button
                type="button"
                onClick={() => {
                  close();
                  showPaywall('upgrade');
                }}
                className="mt-2 inline-flex min-h-11 items-center self-start rounded-full bg-lime px-[18px] text-[14.5px] font-bold text-brand-ink hover:brightness-[.97]"
              >
                Get TukAI
              </button>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
