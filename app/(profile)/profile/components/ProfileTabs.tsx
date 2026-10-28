'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

export type ProfileTabId =
  | 'overview'
  | 'communities'
  | 'moments'
  | 'lists'
  | 'reviews'
  | 'settings';

const TABS: { id: ProfileTabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'Compass01Icon' },
  { id: 'communities', label: 'Communities', icon: 'UserMultipleIcon' },
  { id: 'moments', label: 'Moments', icon: 'Album02Icon' },
  { id: 'lists', label: 'Bucket lists', icon: 'ShoppingBasket02Icon' },
  { id: 'reviews', label: 'Reviews', icon: 'StarIcon' },
  { id: 'settings', label: 'Settings', icon: 'Settings02Icon' },
];

/**
 * The page's sticky tab rail.
 *
 * ⚠️ The design calls for this bleeding to the viewport edge under a fixed
 * 24px gutter. `PageContainer` instead puts the page on a responsive
 * 12-column grid with no single gutter width to bleed against, so this stays
 * the full width of the content column and reuses the sticky offset
 * `PageFilters` already established for "under the top bar" elsewhere.
 */
export const ProfileTabs = ({
  active,
  onChange,
  reviewsCount,
}: {
  active: ProfileTabId;
  onChange: (tab: ProfileTabId) => void;
  reviewsCount: number;
}) => (
  <div className="sticky top-0 z-40 -mx-4 mt-[18px] bg-white py-2.5 min-[720px]:top-[165px] md:mx-0">
    <div
      role="tablist"
      aria-label="Profile sections"
      className="scrollbar-hide relative flex items-center justify-center gap-2 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,transparent,#000_48px,#000_calc(100%-48px),transparent)] md:px-12"
    >
      {TABS.map((tab) => {
        const selected = tab.id === active;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 pl-[13px] text-[14.5px] transition-colors',
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
            {tab.id === 'reviews' && reviewsCount > 0 && (
              <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-brand">
                {reviewsCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);
