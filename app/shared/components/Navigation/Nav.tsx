'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import clsx from 'clsx';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';

import { DESTINATIONS, isDestinationActive } from './destinations';

export const Nav = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const face = session?.user?.image;

  return (
    // From md, not lg: the floating bottom navigation stops at md, so between
    // 768px and 1024px the app had no primary navigation at all.
    //
    // Below xl only the current destination is named, exactly as the mobile
    // bottom bar does it — five labelled items are wider than the header can
    // give, which left the search field too narrow to hold its own contents.
    <nav
      aria-label="Primary"
      className="hidden flex-shrink-0 items-center gap-1 rounded-full bg-gray-50 p-1 md:flex"
    >
      {DESTINATIONS.map((item) => {
        const active = isDestinationActive(item.href, pathname);
        // The canvas puts the reader's own face in place of the icon on "You",
        // which is how that item reads as theirs rather than as a settings page
        const showFace = item.showsFace && Boolean(face);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            // Inactive labels are hidden rather than dropped, so every link
            // keeps its accessible name from its own text
            aria-label={item.label}
            title={item.label}
            className={clsx(
              'flex items-center gap-2 rounded-full py-2.5 text-sm transition-colors xl:px-5',
              // The named item needs the room its label takes
              active
                ? 'bg-surface-brand px-4 font-bold text-brand-ink'
                : 'px-3 font-medium text-ink-muted hover:text-brand-ink',
            )}
          >
            {showFace ? (
              <span
                className={clsx(
                  'relative h-5 w-5 flex-shrink-0 overflow-hidden rounded-full ring-2',
                  active ? 'ring-brand' : 'ring-white',
                )}
              >
                <PhotoImage src={face} alt="" fill sizes="20px" className="object-cover" />
              </span>
            ) : (
              <IconComponent
                iconName={item.icon}
                size={18}
                color="currentColor"
                className={active ? 'text-brand' : 'text-ink-muted'}
              />
            )}
            <span className={clsx(active ? 'inline' : 'hidden xl:inline')}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
