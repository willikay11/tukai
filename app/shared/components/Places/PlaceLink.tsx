'use client';

import { MouseEvent, ReactNode } from 'react';

import Link from 'next/link';

import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { placePath } from '@/utils/detail-paths';

/**
 * A link to a place that opens it in the drawer.
 *
 * It stays a real link: the href is the place's own page, so middle-click,
 * "open in new tab" and the status bar all keep working, and a reader with no
 * drawer above them simply navigates.
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
  /** Run alongside opening the drawer — closing a search panel, say. */
  onNavigate?: () => void;
}) => {
  const drawer = usePlaceDrawer();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();

    // A modified click is the reader asking for a new tab or window
    if (!drawer || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

    event.preventDefault();
    drawer.openPlace(place.id);
  };

  return (
    <Link href={placePath(place)} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
};
