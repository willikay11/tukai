'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { useWaitingOnYouCount } from '@/app/shared/hooks/useWaitingOnYouCount';
import { cn } from '@/lib/utils';

import { DISCOVER_TABS, isTabActive } from './tabs';

/**
 * The tab strip the canvas centres in the top bar.
 *
 * These read as tabs and behave as links: each face of Discover keeps the URL
 * it already had, so a deep link still lands and the back button still means
 * something. The app's actual destinations are in the account menu, and on a
 * phone in the bottom bar.
 */
export const Nav = () => {
  const pathname = usePathname();
  const waitingCount = useWaitingOnYouCount();

  return (
    // Not hidden here: it renders in both the phone bar and the desktop bar,
    // and each of those containers decides where it shows. On a phone the
    // strip is wider than some screens, so it scrolls sideways.
    <nav
      role="tablist"
      aria-label="Discover"
      className="flex min-h-11 flex-shrink-0 items-center gap-2 overflow-x-auto scrollbar-hide"
    >
      {DISCOVER_TABS.map((tab) => {
        const active = isTabActive(tab.href, pathname);
        // Only the Experiences tab ever carries a count - the rest keep
        // relying on their own visible label as their accessible name.
        const isExperiences = tab.href === '/experiences';
        const hasDot = isExperiences && waitingCount > 0;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            aria-label={
              hasDot
                ? `Experiences, ${waitingCount} thing${waitingCount === 1 ? '' : 's'} waiting on you`
                : undefined
            }
            className={cn(
              'relative inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13.5px] transition-colors',
              active
                ? 'bg-surface-tab font-semibold text-brand'
                : 'bg-surface font-medium text-gray-900 hover:brightness-[0.97]',
            )}
          >
            <IconComponent
              iconName={tab.icon}
              size={18}
              color="currentColor"
              // The canvas fills the chosen tab's icon and outlines the rest
              variant={active ? 'bulk' : 'twotone'}
            />
            {tab.label}
            {hasDot && (
              <span
                aria-hidden="true"
                className="absolute right-[7px] top-[5px] h-[9px] w-[9px] rounded-full bg-danger motion-safe:animate-tk-pulse"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
};
