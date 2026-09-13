'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

export interface AnchorTab {
  id: string;
  label: string;
  // Hugeicons name shown before the label
  icon: string;
}

/**
 * In-page navigation, not routing — each pill scrolls to its section and fills
 * in as the reader passes it.
 *
 * Buttons rather than links, and no `Tabs` primitive: that manages which panel
 * is shown, whereas every section here is on the page at once.
 */
export const CommunityAnchorTabs = ({
  tabs,
  activeId,
  onSelect,
}: {
  tabs: AnchorTab[];
  activeId: string;
  onSelect: (id: string) => void;
}) => (
  // The global navbar is sticky from md up and sits 65px tall at z-50, so
  // parking these at top-0 would slide them underneath it. Below md the navbar
  // scrolls away and these take the top edge.
  <div className="sticky top-0 z-20 -mx-4 bg-white/95 px-4 py-3 backdrop-blur md:top-[65px] md:mx-0 md:px-0">
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
              'inline-flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors',
              isActive
                ? 'bg-green-200 font-medium text-primary'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            )}
          >
            {/* The selected pill's icon fills in; the rest stay outlined */}
            <IconComponent
              iconName={tab.icon}
              size={16}
              variant={isActive ? 'solid' : 'twotone'}
              color="currentColor"
              className={isActive ? 'text-primary' : 'text-gray-500'}
            />
            {tab.label}
          </button>
        );
      })}
    </div>
  </div>
);
