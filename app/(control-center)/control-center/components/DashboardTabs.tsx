'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

export type DashboardTabId = 'overview' | 'res' | 'places' | 'host' | 'comms';

const TABS: { id: DashboardTabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'DashboardCircleIcon' },
  { id: 'res', label: 'My reservations', icon: 'Calendar03Icon' },
  { id: 'places', label: 'Places', icon: 'StoreVerified01Icon' },
  { id: 'host', label: 'My experiences (hosting)', icon: 'Ticket01Icon' },
  { id: 'comms', label: 'Communities', icon: 'UserMultipleIcon' },
];

/**
 * The Dashboard's sticky tab bar. Mirrors ProfileTabs' sticky offset and
 * edge-fade mask (this page sits under the same top bar, inside the same
 * gutter-less PageContainer), with a Places-only pulsing dot for pending
 * reservation requests at places this person runs.
 */
export const DashboardTabs = ({
  active,
  onChange,
  placesNewRequestCount,
}: {
  active: DashboardTabId;
  onChange: (tab: DashboardTabId) => void;
  placesNewRequestCount: number;
}) => (
  <div
    data-dashboard-tabs="1"
    className="sticky top-0 z-20 -mx-4 mt-[18px] bg-white py-2.5 min-[720px]:top-[165px] md:mx-0"
  >
    <div
      role="tablist"
      aria-label="Dashboard sections"
      className="scrollbar-hide relative flex items-center justify-center gap-2 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,transparent,#000_48px,#000_calc(100%-48px),transparent)] md:px-12"
    >
      {TABS.map((tab) => {
        const selected = tab.id === active;
        const hasDot = tab.id === 'places' && placesNewRequestCount > 0;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={
              hasDot
                ? `${tab.label}, ${placesNewRequestCount} new reservation request${
                    placesNewRequestCount === 1 ? '' : 's'
                  }`
                : tab.label
            }
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 pl-[13px] text-[14.5px] transition-colors',
              selected
                ? 'bg-surface-tab font-semibold text-brand'
                : 'bg-surface font-medium text-gray-900 hover:bg-surface-brand',
            )}
          >
            <IconComponent
              iconName={tab.icon}
              variant={selected ? 'bulk' : 'twotone'}
              size={20}
              color="currentColor"
            />
            {tab.label}
            {hasDot && (
              <span
                aria-hidden="true"
                className="absolute right-2 top-1.5 h-[9px] w-[9px] rounded-full bg-danger motion-safe:animate-tk-pulse"
              />
            )}
          </button>
        );
      })}
    </div>
  </div>
);
