'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { MEDIA_ZOOM } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';
import { Moment, momentAuthorName, momentContext, momentPhotos } from '@/types/moment';
import { CANVAS_ICONS } from '@/utils/canvas-icons';

import { AlbumCrossfade } from './AlbumCrossfade';
import { MomentAvatar } from './MomentAvatar';
import { momentCaption, momentDate, momentLabel } from './moment-card';

/** The width a card takes in a rail. In a grid it fills the cell instead. */
export const MOMENT_CARD_WIDTH = 'w-[265px]';

/** An album holds up to ten photos; past that the crossfade would drag. */
const MAX_ALBUM_PHOTOS = 10;

/** The ring every focusable part of a card shows, which the canvas left out. */
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

/**
 * A moment: a tall photo with what it was posted against over its corner, then
 * who posted it and when, then their words. The same card in the Moments feed
 * and the other moment grids; a caller that lays it out in columns passes its
 * own width.
 *
 * An album plays through its photos while the photo is hovered, with a dot per
 * photo standing in for a count.
 */
export const MomentCard = ({
  moment,
  onClick,
  priority = false,
  className,
  // Off on the profile's own Moments tab, where every card is already the
  // viewer's - naming them and badging each one "Yours" says nothing new.
  showAuthor = true,
}: {
  moment: Moment;
  onClick: () => void;
  priority?: boolean;
  className?: string;
  showAuthor?: boolean;
}) => {
  const { data: session } = useSession();

  const photos = momentPhotos(moment)
    .slice(0, MAX_ALBUM_PHOTOS)
    .map((media) => media.photo);
  const isAlbum = photos.length > 1;
  const context = momentContext(moment);
  const caption = momentCaption(moment);
  const authorName = momentAuthorName(moment.author);
  const isYours = showAuthor && Boolean(session?.user?.id && session.user.id === moment.author?.id);

  const [isHovered, setIsHovered] = useState(false);

  // "See more" is shown only where the caption actually overflows its two
  // lines. Counting characters cannot answer that - the same count wraps
  // differently at every width - so the clamped element is measured, again
  // once the web fonts land, since they change where the lines break. An open
  // caption is not clamped, so it is not measured: the last answer stands
  // until it is closed again.
  const captionRef = useRef<HTMLParagraphElement | null>(null);
  const [isClamped, setIsClamped] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useLayoutEffect(() => {
    const element = captionRef.current;
    if (!element || isOpen) return;

    let isLive = true;
    const measure = () => {
      if (isLive) setIsClamped(element.scrollHeight > element.clientHeight + 1);
    };
    measure();
    document.fonts?.ready.then(measure);

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);

    return () => {
      isLive = false;
      observer?.disconnect();
    };
  }, [caption, isOpen]);

  return (
    <article
      className={cn(
        'flex min-w-0 flex-shrink-0 snap-start flex-col gap-2.5 text-left',
        MOMENT_CARD_WIDTH,
        className,
      )}
    >
      {/* Only the photo opens the moment. The caption sits outside this button,
          so its See more and See less can be buttons of their own */}
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={momentLabel(moment, { isYours })}
        className={cn(
          'group relative block aspect-[3/4] w-full overflow-hidden rounded-xl bg-surface',
          FOCUS_RING,
        )}
      >
        {isAlbum ? (
          <AlbumCrossfade
            photos={photos}
            isPlaying={isHovered}
            sizes="(max-width: 640px) 100vw, 300px"
            priority={priority}
          />
        ) : (
          <PhotoImage
            src={photos[0]}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            priority={priority}
            className={cn('object-cover', MEDIA_ZOOM)}
          />
        )}

        {/* What it was posted against sits over the photo: a caption on its
            own does not say whether this was a community, a place or an
            experience. It stops short of "Yours" rather than running under it */}
        {context && (
          <span
            className={cn(
              'pointer-events-none absolute left-2.5 top-2.5 z-[4] inline-flex h-7 items-center gap-1.5 rounded-full bg-black/55 px-2.5 text-xs font-semibold text-white backdrop-blur-[6px]',
              isYours ? 'max-w-[calc(100%-86px)]' : 'max-w-[calc(100%-20px)]',
            )}
          >
            <IconComponent
              iconName={CANVAS_ICONS[context.icon]}
              size={14}
              color="currentColor"
              className="flex-shrink-0"
            />
            <span className="truncate">{context.label}</span>
          </span>
        )}

        {isYours && (
          <span className="pointer-events-none absolute right-2.5 top-2.5 z-[4] inline-flex h-6 items-center rounded-full bg-lime px-[9px] text-[11px] font-bold text-brand-ink">
            Yours
          </span>
        )}
      </button>

      <div className="flex min-w-0 items-center gap-2.5">
        {showAuthor && <MomentAvatar src={moment.author?.picture ?? null} name={authorName} size={34} />}
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          {showAuthor && (
            <span className="truncate text-sm font-semibold text-brand-ink">{authorName}</span>
          )}
          <span className="text-[12.5px] text-ink-muted">{momentDate(moment.dateCreated)}</span>
        </div>
      </div>

      {caption && (
        <div className="relative min-w-0">
          <p
            ref={captionRef}
            className={cn(
              'text-sm leading-normal text-ink-summary [text-wrap:pretty]',
              !isOpen && 'line-clamp-2',
            )}
          >
            {caption}
            {isOpen && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-expanded="true"
                  className={cn(
                    'relative whitespace-nowrap font-semibold text-brand before:absolute before:-inset-x-1.5 before:-inset-y-3 before:content-[""] hover:text-brand-deep',
                    FOCUS_RING,
                  )}
                >
                  See less
                </button>
              </>
            )}
          </p>

          {/* Laid over the end of the second line rather than inserted into
              it, so the measurement above stays true. It expands the caption
              in place - the canvas opened the moment here while saying
              aria-expanded, and its notes ask for one or the other */}
          {!isOpen && isClamped && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-expanded="false"
              className={cn(
                'absolute bottom-0 right-0 h-[21px] whitespace-nowrap bg-gradient-to-r from-white/0 from-0% to-white to-[24px] pl-7 text-sm font-semibold leading-[21px] text-brand hover:text-brand-deep',
                // 45px to hit, from a 21px line
                'before:absolute before:-inset-y-3 before:-right-1.5 before:left-3 before:content-[""]',
                FOCUS_RING,
              )}
            >
              See more
            </button>
          )}
        </div>
      )}
    </article>
  );
};
