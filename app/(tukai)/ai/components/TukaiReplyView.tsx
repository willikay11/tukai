'use client';

import { ReactNode } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useTukai } from '@/context/TukaiContext';
import { cn } from '@/lib/utils';
import type { TukaiItem, TukaiMessage } from '@/types/tukai';

import { TukaiDraftCard } from './TukaiDraftCard';
import { TukaiPlanView } from './TukaiPlanView';
import { TukaiResultCard } from './TukaiResultCard';
import { TukaiWritingOptions } from './TukaiWritingOptions';

/** A reply this young reveals in order; anything older is simply there. */
const REVEAL_MS = 4000;

/**
 * One TukAI reply, in the handoff's order: the text, then cards, a plan, a
 * draft or writing options, then "Show on map", then the suggestions (under
 * the last reply only).
 */
export const TukaiReplyView = ({
  chatId,
  message,
  numbers,
  hasPins,
  isShownOnMap,
  isLast,
  communityTitles,
  onOpenItem,
}: {
  chatId: string;
  message: TukaiMessage;
  numbers: Record<string, number>;
  hasPins: boolean;
  isShownOnMap: boolean;
  isLast: boolean;
  communityTitles: Record<string, string>;
  onOpenItem: (item: TukaiItem | undefined) => void;
}) => {
  const { busy, ask, retry, showOnMap, selectPin } = useTukai();
  const items = message.items ?? {};
  const isNew = Date.now() - new Date(message.createdAt).getTime() < REVEAL_MS;

  const blocks: { key: string; node: ReactNode }[] = [];

  if (message.text || message.error) {
    blocks.push({
      key: 'text',
      node: (
        <div className="flex min-w-0 flex-col items-start gap-1.5">
          {message.text && (
            <p
              className={cn(
                'm-0 whitespace-pre-line text-pretty text-[15px] leading-[1.55]',
                message.error ? 'text-danger-deep' : 'text-gray-800',
              )}
            >
              {message.text}
            </p>
          )}
          {message.error && (
            <button
              type="button"
              onClick={() => retry(message.id)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-surface pl-3 pr-4 text-sm font-semibold text-gray-800 hover:bg-surface-brand"
            >
              <IconComponent iconName="RepeatIcon" size={17} color="currentColor" />
              Try again
            </button>
          )}
        </div>
      ),
    });
  }

  const cards = (message.cards ?? []).map((id) => items[id]).filter(Boolean);
  if (cards.length) {
    blocks.push({
      key: 'cards',
      node: (
        <div className="flex flex-col gap-7">
          {cards.map((item) => (
            <TukaiResultCard
              key={item.id}
              item={item}
              number={numbers[item.id]}
              onOpen={() => onOpenItem(item)}
              onHover={() => selectPin(item.id)}
            />
          ))}
        </div>
      ),
    });
  }

  if (message.plan) {
    blocks.push({
      key: 'plan',
      node: (
        <TukaiPlanView
          chatId={chatId}
          message={message}
          numbers={numbers}
          onOpenItem={onOpenItem}
        />
      ),
    });
  }

  if (message.draft) {
    blocks.push({
      key: 'draft',
      node: (
        <TukaiDraftCard
          draft={message.draft}
          place={message.draft.placeId ? items[message.draft.placeId] : undefined}
          communityTitle={communityTitles[message.draft.commId]}
        />
      ),
    });
  }

  if (message.writing) {
    blocks.push({ key: 'writing', node: <TukaiWritingOptions writing={message.writing} /> });
  }

  if (hasPins && !isShownOnMap) {
    blocks.push({
      key: 'map',
      node: (
        <button
          type="button"
          onClick={() => showOnMap(message.id)}
          className="inline-flex min-h-11 items-center gap-1.5 self-start p-0 text-sm font-semibold text-brand hover:underline"
        >
          <IconComponent iconName="Location01Icon" size={18} color="currentColor" />
          Show on map
        </button>
      ),
    });
  }

  if (isLast && !busy && message.suggestions?.length) {
    blocks.push({
      key: 'suggestions',
      node: (
        <div className="flex flex-wrap gap-2">
          {message.suggestions.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => ask(text)}
              className="inline-flex min-h-11 items-center rounded-full bg-lime-soft px-4 py-2 text-left text-sm font-medium leading-[1.35] text-brand-ink hover:bg-lime-soft-hover"
            >
              {text}
            </button>
          ))}
        </div>
      ),
    });
  }

  return (
    <div data-ai-msg="ai" className="flex min-w-0 flex-shrink-0 flex-col gap-3">
      {blocks.map((block, i) => (
        <div
          key={block.key}
          className={cn('flex min-w-0 flex-col', isNew && 'motion-safe:animate-tk-line-in')}
          // Each block 0.12 seconds after the one before
          style={isNew ? { animationDelay: `${i * 0.12}s` } : undefined}
        >
          {block.node}
        </div>
      ))}
    </div>
  );
};
