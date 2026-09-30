'use client';

import { ReactNode } from 'react';

import Link from 'next/link';

import { PhotoImage } from '@/app/shared/components/Images';
import { CARD_LIFT, MEDIA_ZOOM } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';

/**
 * The photo-and-body tile behind every card in the app.
 *
 * Experience, place, community and itinerary cards were each building the same
 * three things by hand — a rounded, clipped media box, a photo that zooms with
 * the card, and a body beneath — which is four places to change whenever the
 * shape moves.
 *
 * ⚠️ The shape is about to move. The canvas draws its card media square (33 of
 * its 40 ratios are 1:1) where ours are 4:3. `ratio` defaults to `'4/3'` so
 * adopting this changes nothing on its own; each screen's own task flips it to
 * `'square'` as that screen is diffed against its artboard.
 */
export type CardRatio = '4/3' | 'square' | '16/9';

const RATIOS: Record<CardRatio, string> = {
  '4/3': 'aspect-[4/3]',
  square: 'aspect-square',
  '16/9': 'aspect-[16/9]',
};

export const CardShell = ({
  href,
  onClick,
  src,
  alt,
  sizes,
  priority = false,
  ratio = '4/3',
  radius = 'rounded-2xl',
  overlay,
  children,
  className,
  mediaClassName,
}: {
  /** Given one, the tile is a link; otherwise the caller handles the press. */
  href?: string;
  onClick?: () => void;
  src: string | null | undefined;
  alt: string;
  sizes: string;
  /** Above the fold: fetched without waiting for the lazy-load observer. */
  priority?: boolean;
  ratio?: CardRatio;
  radius?: string;
  /** Sits over the photo — a bookmark, a category badge, a lock. */
  overlay?: ReactNode;
  /** The body under the photo. */
  children?: ReactNode;
  className?: string;
  mediaClassName?: string;
}) => {
  const body = (
    <>
      <div className={cn('relative w-full overflow-hidden', RATIOS[ratio], radius, mediaClassName)}>
        <PhotoImage
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-cover', MEDIA_ZOOM)}
        />

        {overlay}
      </div>

      {children}
    </>
  );

  // `group` here rather than inside: the photo and the title both respond to a
  // hover anywhere on the tile, and they sit in separate wrappers
  const shared = cn('group block', CARD_LIFT, className);

  if (href) {
    return (
      <Link href={href} className={shared}>
        {body}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={cn(shared, onClick && 'cursor-pointer')}>
      {body}
    </div>
  );
};
