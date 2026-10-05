'use client';

import { KeyboardEvent, ReactNode } from 'react';

import Link from 'next/link';

import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { placePath } from '@/utils/detail-paths';

/**
 * Opens a place in the drawer.
 *
 * A place has no page of its own to send anyone to while the drawer is up, so
 * this is not a link: it carries no href and opens nothing in a new tab.
 * Without a drawer above it - a screen outside the provider - it falls back to
 * the place's own page, which is the only thing left that can show it.
 *
 * role/tabIndex rather than a <button>: callers wrap cards that carry their
 * own controls, and a button inside a button is invalid HTML.
 */
export const PlaceLink = ({
  place,
  className,
  children,
  onNavigate,
}: {
  place: { id: string; slug?: string };
  className?: string;
  children: ReactNode;
  /** Run alongside opening - closing a search panel, say. */
  onNavigate?: () => void;
}) => {
  const drawer = usePlaceDrawer();

  if (!drawer) {
    return (
      <Link href={placePath(place)} onClick={onNavigate} className={className}>
        {children}
      </Link>
    );
  }

  const open = () => {
    onNavigate?.();
    drawer.openPlace(place.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        // Space scrolls the page otherwise
        event.preventDefault();
        open();
      }}
      className={className}
    >
      {children}
    </div>
  );
};
