'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
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

  return (
    // From md, not lg: the floating bottom navigation stops at md, so between
    // 768px and 1024px the app had no navigation at all.
    <nav
      role="tablist"
      aria-label="Discover"
      className="hidden min-h-11 flex-shrink-0 items-center gap-2 md:flex"
    >
      {DISCOVER_TABS.map((tab) => {
        const active = isTabActive(tab.href, pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            role="tab"
            aria-selected={active}
            className={cn(
              'inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm transition-colors',
              active
                ? 'bg-surface-tab font-semibold text-brand'
                : 'bg-surface font-medium text-gray-900 hover:brightness-[0.97]',
            )}
          >
            <IconComponent
              iconName={tab.icon}
              size={20}
              color="currentColor"
              // The canvas fills the chosen tab's icon and outlines the rest
              variant={active ? 'solid' : 'twotone'}
            />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
};
