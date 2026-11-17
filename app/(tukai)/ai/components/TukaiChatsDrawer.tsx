'use client';

import { useMemo, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PlainImage } from '@/app/shared/components/Images';
import { Drawer } from '@/components/ui/drawer';
import { useTukai } from '@/context/TukaiContext';
import { cn } from '@/lib/utils';
import { countUserMessages, planStopCount, plural } from '@/utils/tukai';

const SectionHead = ({ title }: { title: string }) => (
  <div className="sticky top-0 z-[1] -mx-6 flex min-h-11 items-center bg-surface-sticky px-6 py-2">
    <h3 className="m-0 text-[15px] font-bold text-brand-ink">{title}</h3>
  </div>
);

/**
 * "Your chats": search, every chat with a plan, every chat, and the plan
 * card at the bottom. Opening a row closes the drawer.
 */
export const TukaiChatsDrawer = () => {
  const {
    isHistoryOpen,
    setHistoryOpen,
    chats,
    currentChat,
    view,
    openChat,
    deleteChat,
    showOnMap,
    access,
    isUnlocked,
    freeChatsLeft,
    showPaywall,
  } = useTukai();
  const [query, setQuery] = useState('');
  const close = () => setHistoryOpen(false);
  const q = query.trim().toLowerCase();

  // Search matches titles and anything said in a chat
  const found = useMemo(
    () =>
      chats.filter(
        (c) =>
          !q ||
          c.title.toLowerCase().includes(q) ||
          c.messages.some((m) => m.text.toLowerCase().includes(q)),
      ),
    [chats, q],
  );

  const plans = found
    .map((chat) => {
      const message = [...chat.messages].reverse().find((m) => m.plan);
      return message ? { chat, message } : null;
    })
    .filter(Boolean) as {
    chat: (typeof chats)[number];
    message: (typeof chats)[number]['messages'][number];
  }[];

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
        title:
          freeChatsLeft === 2
            ? '2 free chats left'
            : freeChatsLeft === 1
              ? '1 free chat left'
              : 'No free chats left',
        line: 'Each free chat holds up to 10 messages. Get TukAI for unlimited chats and writing help in forms.',
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
                {plans.map(({ chat, message }) => {
                  const plan = message.plan!;
                  const first = plan.days[0]?.stops[0];
                  const img = first ? message.items?.[first.id]?.photos[0] : undefined;
                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => {
                        close();
                        openChat(chat.id);
                        showOnMap(message.id);
                      }}
                      className={cn(
                        '-mx-3 flex w-[calc(100%+24px)] items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface',
                        isCurrent(chat.id) && 'bg-surface-brand',
                      )}
                    >
                      {img ? (
                        <PlainImage
                          src={img}
                          alt=""
                          className="block h-14 w-14 flex-shrink-0 rounded-xl bg-surface-brand object-cover"
                        />
                      ) : (
                        <span className="block h-14 w-14 flex-shrink-0 rounded-xl bg-surface-brand" />
                      )}
                      <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                        <span className="truncate text-[14.5px] font-semibold leading-[1.35] text-gray-800">
                          {plan.title}
                        </span>
                        <span className="text-[13px] text-ink-muted">
                          {plural(plan.days.length, 'day')} {'·'}{' '}
                          {plural(planStopCount(plan), 'stop')}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {found.length > 0 && (
            <section aria-label="Chats" className="flex flex-col">
              <SectionHead title="Chats" />
              <div className="flex flex-col pt-1.5">
                {found.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      '-mx-3 flex items-center gap-1 rounded-xl hover:bg-surface',
                      isCurrent(chat.id) && 'bg-surface-brand',
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        close();
                        openChat(chat.id);
                      }}
                      aria-current={isCurrent(chat.id)}
                      className="flex min-h-[60px] min-w-0 flex-1 flex-col justify-center gap-[3px] py-2 pl-3 pr-1 text-left"
                    >
                      <span className="truncate text-[14.5px] font-semibold leading-[1.35] text-gray-800">
                        {chat.title}
                      </span>
                      <span className="text-[13px] text-ink-muted">
                        {plural(countUserMessages(chat.messages), 'message')}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteChat(chat.id)}
                      aria-label={`Delete chat: ${chat.title}`}
                      className="mr-1.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-danger-surface hover:text-danger"
                    >
                      <IconComponent iconName="Delete02Icon" size={18} color="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {found.length === 0 && (
            <p className="m-0 text-pretty text-[15px] leading-normal text-ink-muted">
              {q
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
