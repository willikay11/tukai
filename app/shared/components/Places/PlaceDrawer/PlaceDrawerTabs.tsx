'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

import { PlaceDrawerTab } from './tabs';

/**
 * In-drawer navigation, not routing — each pill scrolls to its section and
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
  <div className="flex gap-2 overflow-x-auto scrollbar-hide" role="tablist">
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
            'inline-flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-[15px] transition-colors',
            isActive
              ? 'bg-green-200 font-semibold text-brand'
              : 'bg-surface text-gray-900 hover:bg-surface-muted',
          )}
        >
          {/* The selected pill's icon fills in; the rest stay outlined */}
          <IconComponent
            iconName={tab.icon}
            size={18}
            variant={isActive ? 'solid' : 'twotone'}
            color="currentColor"
            className={isActive ? 'text-brand' : 'text-gray-500'}
          />
          {tab.label}
        </button>
      );
    })}
  </div>
);
