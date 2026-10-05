'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { FannedPhotos, PhotoImage } from '@/app/shared/components/Images';
import { MomentAvatar } from '@/app/shared/components/Moments';
import { MEDIA_ZOOM } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';
import { Moment, momentAuthorName, momentContext, momentPhotos } from '@/types/moment';
import { CANVAS_ICONS } from '@/utils/canvas-icons';

import { momentCaption, momentDate } from './moment-card';

/** The width a card takes in the Recent moments rail. */
export const MOMENT_CARD_WIDTH = 'w-[265px]';

/**
 * A moment, as the design draws it on Discover: a tall photo with what it was
 * posted against over its corner, then who posted it and when, then their
 * words.
 *
 * Deliberately not the masonry tile the Moments page uses - that one is a
 * photo sized to itself with an author chip laid over it, and carries no
 * caption at all.
 */
export const MomentCard = ({
  moment,
  onClick,
  priority = false,
}: {
  moment: Moment;
  onClick: () => void;
  priority?: boolean;
}) => {
  const { data: session } = useSession();

  const photos = momentPhotos(moment);
  const context = momentContext(moment);
  const caption = momentCaption(moment);
  const authorName = momentAuthorName(moment.author);
  const isYours = Boolean(session?.user?.id && session.user.id === moment.author?.id);

  // "See more" is shown only where the caption actually overflows its two
  // lines. Counting characters cannot answer that - the same count wraps
  // differently at every width - so the clamped element is measured.
  const captionRef = useRef<HTMLSpanElement | null>(null);
  const [isClamped, setIsClamped] = useState(false);

  useLayoutEffect(() => {
    const element = captionRef.current;
    if (!element) return;

    const measure = () => setIsClamped(element.scrollHeight > element.clientHeight + 1);
    measure();

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);

    return () => observer?.disconnect();
  }, [caption]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('group flex flex-shrink-0 snap-start flex-col text-left', MOMENT_CARD_WIDTH)}
    >
      <span className="relative block aspect-[3/4] w-full overflow-hidden rounded-2xl bg-surface">
        <PhotoImage
          src={photos[0]?.photo}
          alt={moment.title}
          fill
          sizes="265px"
          priority={priority}
          className={cn('object-cover', MEDIA_ZOOM)}
        />

        {/* What it was posted against sits over the photo: a caption on its
            own does not say whether this was a community, a place or an
            experience */}
        {context && (
          <span className="absolute left-2.5 top-2.5 inline-flex h-8 max-w-[calc(100%-20px)] items-center gap-1.5 rounded-full bg-black/60 px-3 text-[13px] font-semibold text-white backdrop-blur-md">
            <IconComponent
              iconName={CANVAS_ICONS[context.icon]}
              size={15}
              color="currentColor"
              className="flex-shrink-0"
            />
            <span className="truncate">{context.label}</span>
          </span>
        )}

        {isYours && (
          <span className="absolute right-2.5 top-2.5 inline-flex h-6 items-center rounded-full bg-lime px-[9px] text-[11px] font-bold text-brand-ink">
            Yours
          </span>
        )}

        {/* A moment can carry several photos; the pile says so without
            needing a count */}
        {photos.length > 1 && (
          <FannedPhotos
            photos={photos.slice(1, 4).map((media) => media.photo)}
            size="sm"
            className="absolute bottom-3 right-3"
          />
        )}
      </span>

      <span className="mt-3 flex min-w-0 items-center gap-2.5">
        <MomentAvatar src={moment.author?.picture ?? null} name={authorName} size={36} />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold text-brand-ink">{authorName}</span>
          <span className="text-[13px] text-ink-muted">{momentDate(moment.dateCreated)}</span>
        </span>
      </span>

      {caption && (
        <span
          ref={captionRef}
          className="relative mt-3 line-clamp-2 text-[15px] leading-[1.45] text-gray-800"
        >
          {caption}
          {isClamped && (
            // Laid over the end of the second line rather than inserted into
            // it, so the measurement above stays true
            <span className="absolute bottom-0 right-0 bg-background pl-1 font-semibold text-brand">
              See more
            </span>
          )}
        </span>
      )}
    </button>
  );
};
