'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

import { PlaceDrawerTab } from './tabs';

/**
 * In-drawer navigation, not routing - each pill scrolls to its section and
 * fills in as the reader passes it.
 */
export const PlaceDrawerTabs = ({
  tabs,
  activeId,
  onSelect,
}: {
  tabs: PlaceDrawerTab[];
  activeId: string;
  onSelect: (id: string) => void;
}) => (
  // The -mx-6 / px-6 pair runs the row to the drawer's edges, so a scrolled-to-end
  // last pill keeps the 24px gutter instead of stopping at the content edge
  <div className="-mx-6 flex gap-2 overflow-x-auto px-6 scrollbar-hide" role="tablist">
    {tabs.map((tab) => {
      const isActive = activeId === tab.id;

      return (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onSelect(tab.id)}
          className={cn(
            'inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full pl-3 pr-3 text-[14.5px] font-medium transition duration-150 hover:brightness-[0.97] active:scale-[0.98]',
            isActive ? 'bg-surface-pill-active text-brand' : 'bg-surface-pill text-ink-pill',
          )}
        >
          {/* The selected pill's icon fills in; the rest stay outlined */}
          <IconComponent
            iconName={tab.icon}
            size={21}
            variant={isActive ? 'solid' : 'twotone'}
            color="currentColor"
          />
          {tab.label}
        </button>
      );
    })}
  </div>
);
