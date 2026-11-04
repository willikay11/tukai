'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  TukaiDots,
  TukaiMark,
  TukaiPaid,
  TukaiPay,
  TukaiPaywall,
} from '@/app/shared/components/TukAI';
import { useMyCommunities } from '@/app/shared/hooks/useCommunities';
import { useTukai } from '@/context/TukaiContext';
import { cn } from '@/lib/utils';
import type { Community } from '@/types/community';
import { plural, tukaiPins } from '@/utils/tukai';

import { useOpenTukaiItem } from '../hooks';
import { TukaiChatsDrawer } from './TukaiChatsDrawer';
import { TukaiComposer } from './TukaiComposer';
import { TukaiHeader } from './TukaiHeader';
import { TukaiMapSheet } from './TukaiMapSheet';
import { TukaiReplyView } from './TukaiReplyView';

const TOP_BAR = '[data-top-bar]';

/** The site's top bar height, so the page sits right under it whatever it holds. */
const useTopBarHeight = () => {
  const [height, setHeight] = useState(72);
  useLayoutEffect(() => {
    const bar = document.querySelector<HTMLElement>(TOP_BAR);
    if (!bar) return;
    const measure = () => setHeight(bar.getBoundingClientRect().height || 72);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);
  return height;
};

/**
 * The TukAI page: one centred column of chat under the top bar, the
 * composer fading over its foot, and the map rising as a sheet over the
 * bottom of the chat (the handoff's default "In grid" layout).
 *
 * ⚠️ The "Full screen" layout, with the map as a pane beside the chat, is a
 * prototype option and not built.
 */
export const TukaiPageContent = () => {
  const {
    view,
    currentChat,
    busy,
    firstName,
    mapMessageId,
    isMapSheetOpen,
    setMapSheetOpen,
    showOnMap,
    selectedPinId,
    selectPin,
    isHistoryOpen,
  } = useTukai();
  const { data: session } = useSession();
  const { owned } = useMyCommunities((session?.user as any)?.id);
  const openItem = useOpenTukaiItem();
  const top = useTopBarHeight();
  const bodyRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => currentChat?.messages ?? [], [currentChat]);
  const isEmptyChat = view === 'chat' && messages.length === 0;
  const communityTitles = useMemo(
    () => Object.fromEntries(owned.map((c: Community) => [c.id, c.title])),
    [owned],
  );

  // The map shows the reply whose "Show on map" was pressed, or else the
  // latest reply with cards or a plan
  const mapMessage = useMemo(() => {
    const picked = mapMessageId ? messages.find((m) => m.id === mapMessageId) : null;
    return (
      picked ??
      [...messages]
        .reverse()
        .find((m) => m.role === 'ai' && ((m.cards ?? []).length > 0 || Boolean(m.plan))) ??
      null
    );
  }, [mapMessageId, messages]);
  const mapPins = useMemo(() => (mapMessage ? tukaiPins(mapMessage).pins : []), [mapMessage]);
  const isSheetOpen = view === 'chat' && isMapSheetOpen && mapPins.length > 0;
  const planDays = mapMessage?.plan?.days.length ?? 0;

  // The page owns the window while it is open: nothing scrolls behind it
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Escape closes the map sheet; the drawers handle their own
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSheetOpen && !isHistoryOpen) setMapSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isHistoryOpen, isSheetOpen, setMapSheetOpen]);

  // A new reply scrolls so its top sits 12px under the top of the chat;
  // anything else (a sent message, the thinking row) scrolls to the bottom
  const scrollKey = [currentChat?.id, messages.length, busy ? 1 : 0, view].join(':');
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    requestAnimationFrame(() => {
      if (view !== 'chat') {
        body.scrollTop = 0;
        return;
      }
      const last = messages[messages.length - 1];
      if (last?.role === 'ai' && !busy) {
        const replies = body.querySelectorAll('[data-ai-msg="ai"]');
        const reply = replies[replies.length - 1];
        if (reply) {
          body.scrollTop +=
            reply.getBoundingClientRect().top - body.getBoundingClientRect().top - 12;
          return;
        }
      }
      body.scrollTop = body.scrollHeight;
    });
    // Keyed on what changed, not on every new array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollKey]);

  // Tapping a pin brings its card into view in the chat
  const showCard = useCallback(
    (id: string) => {
      selectPin(id);
      requestAnimationFrame(() => {
        const body = bodyRef.current;
        if (!body) return;
        const cards = body.querySelectorAll(`[data-ai-card="${CSS.escape(id)}"]`);
        const card = cards[cards.length - 1];
        if (!card) return;
        const sheet = body.parentElement?.querySelector('[data-ai-sheet="open"]');
        const bodyBox = body.getBoundingClientRect();
        const cardBox = card.getBoundingClientRect();
        const visibleBottom = sheet
          ? Math.min(bodyBox.bottom, sheet.getBoundingClientRect().top)
          : bodyBox.bottom;
        if (cardBox.top < bodyBox.top || cardBox.bottom > visibleBottom) {
          body.scrollTop += cardBox.top - bodyBox.top - 40;
        }
      });
    },
    [selectPin],
  );

  const lastIndex = messages.length - 1;

  return (
    <div
      data-screen-label="TukAI"
      className="fixed inset-x-0 bottom-[calc(69px+env(safe-area-inset-bottom))] z-20 flex bg-white text-gray-800 min-[720px]:bottom-0"
      style={{ top }}
    >
      <div className="relative mx-auto flex h-full w-full max-w-[1360px] gap-0 min-[1100px]:gap-6 min-[1100px]:px-6 min-[1100px]:pt-4">
        <section
          aria-label="TukAI chat"
          className={cn(
            'relative flex min-w-0 flex-1 flex-col',
            // An empty chat scrolls as a whole, so the heading, composer and
            // starters still fit on a short screen
            isEmptyChat && 'overflow-y-auto scrollbar-hide',
          )}
        >
          <TukaiHeader isEmptyChat={isEmptyChat} />

          <div
            ref={bodyRef}
            className={cn(
              'flex min-h-0 flex-col overflow-y-auto overscroll-contain pl-5 pr-6 pt-6 scrollbar-hide min-[720px]:pl-6',
              isEmptyChat ? 'flex-[1_0_auto]' : 'flex-[1_1_auto]',
              isSheetOpen ? 'pb-[58vh]' : 'pb-12',
            )}
          >
            <div
              className={cn(
                'flex w-full max-w-[760px] flex-col gap-5',
                isEmptyChat ? 'mx-auto mb-0 mt-auto' : 'mx-auto',
              )}
            >
              {view === 'paywall' && <TukaiPaywall />}
              {view === 'pay' && <TukaiPay />}
              {view === 'paid' && <TukaiPaid />}

              {view === 'chat' && isEmptyChat && (
                <div className="flex flex-shrink-0 flex-col items-center gap-2 px-0.5 text-center">
                  <h2 className="m-0 self-stretch text-balance text-[28px] font-bold leading-[1.2] tracking-[-0.4px] text-brand-ink">
                    Hi{firstName ? ` ${firstName}` : ''}, what are we planning?
                  </h2>
                  <p className="m-0 max-w-[480px] text-pretty text-[15px] leading-normal text-ink-note">
                    Ask for places, plans and experiences, or for help writing. I only suggest what
                    is on Tukai.
                  </p>
                </div>
              )}

              {view === 'chat' &&
                currentChat &&
                messages.map((message, i) => {
                  if (message.role === 'user') {
                    return (
                      <div
                        key={message.id}
                        data-ai-msg="user"
                        className="max-w-[85%] flex-shrink-0 self-end whitespace-pre-line rounded-[18px_18px_6px_18px] bg-surface-bubble px-3.5 py-2.5 text-[15px] leading-normal text-brand-ink [overflow-wrap:anywhere]"
                      >
                        {message.text}
                      </div>
                    );
                  }
                  const { numbers, pins } = tukaiPins(message);
                  return (
                    <TukaiReplyView
                      key={message.id}
                      chatId={currentChat.id}
                      message={message}
                      numbers={numbers}
                      hasPins={pins.length > 0}
                      isShownOnMap={isSheetOpen && mapMessage?.id === message.id}
                      isLast={i === lastIndex}
                      communityTitles={communityTitles}
                      onOpenItem={openItem}
                    />
                  );
                })}

              {view === 'chat' && busy && (
                <div role="status" className="flex flex-shrink-0 items-center gap-2.5">
                  <TukaiMark size="sm" />
                  <TukaiDots />
                  <span className="text-[13.5px] text-ink-muted">Looking through Tukai</span>
                </div>
              )}
            </div>
          </div>

          {view === 'chat' && (
            <div className="relative z-[2] -mt-9 flex-shrink-0 bg-gradient-to-b from-white/0 to-white to-40% pb-3 pl-5 pr-6 pt-6 min-[720px]:pl-6">
              {!isEmptyChat && mapPins.length > 0 && !isSheetOpen && (
                <button
                  type="button"
                  onClick={() => showOnMap(mapMessage?.id ?? null)}
                  className="absolute -top-[30px] left-1/2 z-[3] inline-flex h-11 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/70 bg-white/60 pl-3.5 pr-[18px] text-[14.5px] font-semibold text-brand-ink shadow-[0_8px_28px_rgba(1,51,52,.16),inset_0_1px_0_rgba(255,255,255,.8)] backdrop-blur-[18px] backdrop-saturate-[1.6] hover:bg-white/75"
                >
                  <IconComponent
                    iconName="Location01Icon"
                    size={18}
                    color="currentColor"
                    className="text-brand"
                  />
                  {planDays ? 'Show the plan on a map' : 'Show on map'}
                </button>
              )}
              <TukaiComposer isEmptyChat={isEmptyChat} />
            </div>
          )}
          {/* In an empty chat the heading and composer sit together a little above the middle */}
          {isEmptyChat && <div aria-hidden="true" className="min-h-0 flex-[1.25_100_450px]" />}

          {view === 'chat' && !isEmptyChat && (
            <TukaiMapSheet
              isOpen={isSheetOpen}
              title={mapMessage?.plan?.title ?? 'On the map'}
              meta={
                planDays
                  ? `${plural(planDays, 'day')} · ${plural(mapPins.length, 'stop')}`
                  : plural(mapPins.length, 'suggestion')
              }
              pins={mapPins}
              route={Boolean(mapMessage?.plan)}
              selectedId={selectedPinId}
              onClose={() => setMapSheetOpen(false)}
              onPin={showCard}
              onOpenPin={(id) => openItem(mapMessage?.items?.[id])}
            />
          )}
        </section>
      </div>

      <TukaiChatsDrawer />
    </div>
  );
};
