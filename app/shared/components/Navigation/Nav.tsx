'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import clsx from 'clsx';

import { IconComponent } from '@/app/shared/components/Icons';

const NAV_ITEMS = [
  { label: 'Discover', href: '/', icon: 'CompassIcon' },
  { label: 'Experiences', href: '/experiences', icon: 'Ticket01Icon' },
  { label: 'Places', href: '/places', icon: 'Location01Icon' },
  { label: 'Moments', href: '/moments', icon: 'DashboardSquare01Icon' },
];

export const Nav = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    // From md, not lg: the floating bottom navigation stops at md, so between
    // 768px and 1024px the app had no primary navigation at all.
    //
    // Below xl only the current destination is named, exactly as the mobile
    // bottom bar does it — four labelled items are ~460px, which left the
    // search field too narrow to hold its own contents.
    <nav className="hidden flex-shrink-0 items-center gap-1 rounded-full bg-gray-50 p-1 md:flex">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            // Inactive labels are hidden rather than dropped, so every link
            // keeps its accessible name from its own text
            aria-label={item.label}
            title={item.label}
            className={clsx(
              'flex items-center gap-2 rounded-full py-2.5 text-sm font-medium transition-colors xl:px-5',
              // The named item needs the room its label takes
              active
                ? 'bg-white px-4 text-gray-900 shadow-sm'
                : 'px-3 text-gray-700 hover:text-gray-900',
            )}
          >
            <IconComponent
              iconName={item.icon}
              size={18}
              className={active ? 'text-primary' : 'text-gray-600'}
            />
            <span className={clsx(active ? 'inline' : 'hidden xl:inline')}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
