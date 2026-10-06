'use client';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { TukaiImage } from '@/components/ui/image';
import { cn } from '@/lib/utils';

import { DESTINATIONS, isDestinationActive } from './destinations';

// A detail page owns the bottom of its own screen: both carry a floating bar
// of their own actions, and two floating rows would sit on top of each other.
//
// Anything else with a single segment after the section is a record addressed
// by slug; these are the pages that are not.
const DETAIL_SUBROUTES: Record<string, string[]> = {
  experiences: ['create', 'type', 'see-all', 'booking-success'],
  places: ['claim', 'see-all'],
  // A single list floats its owner's actions along the bottom edge; the index
  // of lists has no such bar and keeps the nav
  'bucket-lists': [],
};

const isDetailPage = (pathname: string): boolean => {
  const [, section, id, ...rest] = pathname.split('/');
  const subroutes = DETAIL_SUBROUTES[section];

  return Boolean(subroutes) && Boolean(id) && rest.length === 0 && !subroutes.includes(id);
};

export const BottomNavigation = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { data: session } = useSession();

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

  // A single experience puts its booking bar along the bottom edge, and that
  // CTA is the point of the page - two bars would sit on top of each other
  if (isDetailPage(pathname)) return null;

  // Same reason, for a tab rather than a route: "My Communities" floats its
  // own Create Community button there. The tab is in the URL precisely so this
  // can see it.
  if (pathname === '/communities' && searchParams.get('tab') === 'mine') return null;

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 bg-white shadow-top-md transition-transform duration-300 ease-in-out md:hidden',
        isVisible ? 'translate-y-0' : 'translate-y-[150%]',
      )}
    >
      {/* Five equal columns across the full width, each an icon over its label.
          The active one takes a soft pill behind its icon and a heavier label. */}
      <nav
        aria-label="Primary"
        className="grid grid-cols-5 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      >
        {DESTINATIONS.map((link) => {
          const active = isDestinationActive(link.href, pathname);
          // The reader's face stands in for the "You" icon once it is known
          const face = link.showsFace ? session?.user?.image : undefined;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-1 text-[11px] transition-colors duration-200 active:scale-95 motion-reduce:transform-none',
                active ? 'font-semibold text-gray-900' : 'font-medium text-gray-500',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-16 items-center justify-center rounded-full transition-colors duration-200',
                  active && 'bg-surface-tab',
                )}
              >
                {face ? (
                  <span className="relative h-6 w-6 overflow-hidden rounded-full">
                    <TukaiImage
                      src={face}
                      alt={session?.user?.name || link.label}
                      fill
                      sizes="24px"
                      style={{ objectFit: 'cover' }}
                      showNotFoundText={false}
                    />
                  </span>
                ) : (
                  <IconComponent
                    iconName={link.icon}
                    size={22}
                    color="currentColor"
                    variant={active ? 'solid' : 'twotone'}
                  />
                )}
              </span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
