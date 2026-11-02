'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

export interface CommunityPageTab {
  value: string;
  label: string;
  /** Hugeicons name - shown twotone unselected, bulk once chosen. */
  icon: string;
}

/**
 * The Communities page's own tab row - the handoff's soft-green pill, not the
 * generic segmented `PillTabs` control (a grey track with a raised white
 * pill) other pages use. A `role="tablist"` of individual pills, each with
 * its own icon that switches to the bulk variant once selected.
 */
export const CommunityPageTabs = ({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: CommunityPageTab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) => (
  <div
    role="tablist"
    aria-label="Communities"
    className={cn('flex gap-2 overflow-x-auto scrollbar-hide', className)}
  >
    {tabs.map((tab) => {
      const selected = tab.value === value;

      return (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={selected}
          onClick={() => onChange(tab.value)}
          className={cn(
            'inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full pl-3.5 pr-[18px] text-[14.5px] transition-colors',
            selected
              ? 'bg-surface-brand font-semibold text-brand'
              : 'bg-surface font-medium text-gray-800 hover:bg-surface-tab',
          )}
        >
          <IconComponent
            iconName={tab.icon}
            variant={selected ? 'bulk' : 'twotone'}
            size={20}
            color="currentColor"
          />
          {tab.label}
        </button>
      );
    })}
  </div>
);
