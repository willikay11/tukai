'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

import { AskTukaiButton } from './AskTukaiButton';

// The same four destinations the desktop nav offers, in the same order, so the
// two do not drift
const LINKS = [
  { label: 'Discover', href: '/', icon: 'CompassIcon' },
  { label: 'Experiences', href: '/experiences', icon: 'Ticket01Icon' },
  { label: 'Places', href: '/places', icon: 'Location01Icon' },
  { label: 'Moments', href: '/moments', icon: 'DashboardSquare01Icon' },
];

export const BottomNavigation = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 transition-transform duration-300 ease-in-out md:hidden',
        isVisible ? 'translate-y-0' : 'translate-y-[150%]',
      )}
    >
      {/* The destinations sit in one floating pill */}
      <nav
        aria-label="Primary"
        // p-1 rather than p-2: the items carry their own padding, so the pill
        // only needs enough to keep the active lime chip off its edge
        className="flex items-center gap-1 rounded-full bg-white p-1 shadow-lg"
      >
        {LINKS.map((link) => {
          const active = isActive(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full transition-colors',
                // Only the current destination is named; the rest are icons, so
                // four fit across a phone
                active ? 'bg-lime px-4 py-2.5 text-primary' : 'px-3 py-2.5 text-gray-500',
              )}
            >
              <IconComponent
                iconName={link.icon}
                size={20}
                color="currentColor"
                variant={active ? 'solid' : 'twotone'}
              />
              {active && <span className="text-sm font-semibold">{link.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* TukAI sits apart from the destinations — it opens an assistant, not a
          page of content. Same button the desktop header carries. */}
      <AskTukaiButton className="h-12 w-12 shadow-lg" iconSize={22} />
    </div>
  );
};
