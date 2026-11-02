'use client';

import { useEffect, useRef } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

import { CommunityDrawerTab } from './tabs';

/** Keeps half of the tab before the current one in view, per the handoff. */
const GUTTER = 24;

/**
 * The section tabs: they scroll the body rather than switch what it shows, so
 * this is a `nav` of buttons with `aria-current="location"` on the current one
 * rather than a tablist.
 */
export const CommunityDrawerTabs = ({
  tabs,
  activeId,
  onSelect,
}: {
  tabs: CommunityDrawerTab[];
  activeId: string;
  onSelect: (id: string) => void;
}) => {
  const rowRef = useRef<HTMLElement | null>(null);

  // When the current tab changes, the row slides so half of the tab before it
  // still shows - enough to say there is more that way
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const index = tabs.findIndex((tab) => tab.id === activeId);
    const buttons = row.querySelectorAll<HTMLButtonElement>('button');
    const current = buttons[index];
    if (!current) return;

    const previous = buttons[index - 1];
    const target = previous
      ? previous.offsetLeft + previous.offsetWidth / 2 - GUTTER
      : current.offsetLeft - GUTTER;
    const max = row.scrollWidth - row.clientWidth;

    row.scrollTo?.({ left: Math.max(0, Math.min(target, max)), behavior: 'smooth' });
  }, [activeId, tabs]);

  return (
    <nav
      ref={rowRef}
      aria-label="Sections"
      className="flex items-center gap-2 overflow-x-auto px-6 py-3 scrollbar-hide"
    >
      {tabs.map((tab) => {
        const isCurrent = tab.id === activeId;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            aria-current={isCurrent ? 'location' : undefined}
            className={cn(
              'inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full pl-3 pr-[18px] text-[14.5px] font-medium transition duration-150 hover:brightness-[0.97] active:scale-[0.98]',
              isCurrent ? 'bg-surface-pill-active text-brand' : 'bg-surface text-gray-800',
            )}
          >
            <IconComponent
              iconName={tab.icon}
              size={21}
              variant={isCurrent ? 'bulk' : 'twotone'}
              color="currentColor"
            />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};
