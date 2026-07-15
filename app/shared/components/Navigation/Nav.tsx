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
    <nav className="hidden flex-shrink-0 items-center gap-1 rounded-full bg-gray-50 p-1 lg:flex">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors',
              active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:text-gray-900',
            )}
          >
            <IconComponent
              iconName={item.icon}
              size={18}
              className={active ? 'text-primary' : 'text-gray-600'}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
