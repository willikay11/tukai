'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { useCloseAllPanels } from '@/app/shared/hooks/useCloseAllPanels';
import { TukaiImage } from '@/components/ui/image';
import { useAuthDialog } from '@/context/AuthDialogContext';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { needAuth } = useAuthDialog();
  const closeAllPanels = useCloseAllPanels();

  // A single experience puts its booking bar along the bottom edge, and that
  // CTA is the point of the page - two bars would sit on top of each other
  if (isDetailPage(pathname)) return null;

  // Same reason, for a tab rather than a route: "My Communities" floats its
  // own Create Community button there. The tab is in the URL precisely so this
  // can see it.
  if (pathname === '/communities' && searchParams.get('tab') === 'mine') return null;

  return (
    // Phones only. Four equal columns, each an icon pill over its label; the
    // current one takes a soft pill and a heavier label. The bottom padding
    // carries the home-indicator inset, so the bar is 69px plus that inset -
    // the height sheets and floating elements clear.
    //
    // z-49: over the sheets (48) it sits beneath, under the dialogs and
    // popovers (50) that dim or cover everything. The handoff's 60/61/85 are
    // the same order, renumbered around the z-50 the dialog primitives use.
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-[49] grid grid-cols-4 border-t border-surface-muted bg-white px-1 pb-[calc(4px+env(safe-area-inset-bottom))] pt-1 min-[720px]:hidden"
    >
      {DESTINATIONS.map((destination) => {
        const active = isDestinationActive(destination, pathname);
        // The reader's face stands in for the "You" icon once it is known
        const face = destination.showsFace ? session?.user?.image : undefined;

        return (
          <Link
            key={destination.href}
            href={destination.href}
            aria-current={active ? 'page' : undefined}
            onClick={(event) => {
              // A panel open over the page would stay open over the next one
              closeAllPanels();

              if (!destination.needsAccount || session?.user) return;
              event.preventDefault();
              needAuth(destination.needsAccount, () => router.push(destination.href));
            }}
            className={cn(
              'flex min-h-[60px] min-w-0 flex-col items-center justify-start gap-[3px] px-0.5 pb-1 pt-1.5 text-center text-[11.5px] leading-[1.2]',
              active ? 'font-bold text-brand-ink' : 'font-medium text-ink-muted',
            )}
          >
            <span
              className={cn(
                'relative flex h-[30px] w-[52px] flex-shrink-0 items-center justify-center rounded-full',
                active && 'bg-surface-brand',
              )}
            >
              {face ? (
                <span
                  className={cn(
                    'relative h-6 w-6 overflow-hidden rounded-full bg-surface-brand',
                    active ? 'ring-2 ring-brand' : 'ring-2 ring-white',
                  )}
                >
                  <TukaiImage
                    src={face}
                    alt=""
                    fill
                    sizes="24px"
                    style={{ objectFit: 'cover' }}
                    showNotFoundText={false}
                  />
                </span>
              ) : (
                <IconComponent iconName={destination.icon} size={21} color="currentColor" />
              )}
            </span>
            <span className="max-w-full text-balance">{destination.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
