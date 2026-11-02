'use client';

import { useRef } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

export interface PageTab {
  value: string;
  label: string;
  /** Hugeicons name - shown twotone unselected, bulk once chosen. */
  icon: string;
  /** A count after the label, such as invites waiting. */
  badge?: { count: number; label: string };
}

/** The id a tab's panel carries, so the panel can point back at its tab. */
export const pageTabPanelId = (idPrefix: string, value: string) => `${idPrefix}-panel-${value}`;
export const pageTabId = (idPrefix: string, value: string) => `${idPrefix}-tab-${value}`;

/**
 * A page's own row of soft-green pill tabs, each with an icon that turns bulk
 * once selected - the Bucket lists page's tab row.
 *
 * A full tabs pattern: one tab stop, the arrow keys (and Home and End) move
 * between tabs and select as they go, and each tab controls the panel with
 * `pageTabPanelId`, which the page renders with `role="tabpanel"`.
 */
export const PageTabs = ({
  tabs,
  value,
  onChange,
  ariaLabel,
  idPrefix,
  className,
}: {
  tabs: PageTab[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  idPrefix: string;
  className?: string;
}) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const last = tabs.length - 1;
    const next =
      event.key === 'ArrowRight'
        ? index === last
          ? 0
          : index + 1
        : event.key === 'ArrowLeft'
          ? index === 0
            ? last
            : index - 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null;

    if (next === null) return;
    event.preventDefault();
    onChange(tabs[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('flex gap-2 overflow-x-auto scrollbar-hide', className)}
    >
      {tabs.map((tab, index) => {
        const selected = tab.value === value;

        return (
          <button
            key={tab.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            id={pageTabId(idPrefix, tab.value)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={pageTabPanelId(idPrefix, tab.value)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full pl-3.5 pr-[18px] text-[14.5px] transition-colors duration-150',
              selected
                ? 'bg-surface-tab font-semibold text-brand'
                : 'bg-surface font-medium text-gray-800',
            )}
          >
            <IconComponent
              iconName={tab.icon}
              variant={selected ? 'bulk' : 'twotone'}
              size={20}
              color="currentColor"
            />
            {tab.label}
            {tab.badge && tab.badge.count > 0 && (
              <span
                aria-label={tab.badge.label}
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1.5 text-[11.5px] font-bold text-brand-ink"
              >
                {tab.badge.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
