'use client';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { MEDIA_ZOOM } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';
import { Moment, momentContext, momentPhotos } from '@/types/moment';
import { CANVAS_ICONS } from '@/utils/canvas-icons';

import { momentByline, momentPreview } from './moment-card';

/**
 * A moment, as the canvas draws it in the Recent moments grid: a square photo,
 * then what it was posted against, the caption, and who posted it when.
 *
 * Deliberately not the masonry tile the Moments page uses. That one is a photo
 * with an author chip over it, sized to the photo; this one is square and
 * leads on the parent, because a moment on Discover has to say what it is
 * about before it says whose it is.
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

  const photo = momentPhotos(moment)[0]?.photo;
  const context = momentContext(moment);
  const preview = momentPreview(moment);
  const isYours = Boolean(session?.user?.id && session.user.id === moment.author?.id);

  return (
    <button type="button" onClick={onClick} className="group flex min-w-0 flex-col gap-2 text-left">
      <span className="relative block aspect-square w-full overflow-hidden rounded-xl bg-surface">
        <PhotoImage
          src={photo}
          alt={moment.title}
          fill
          sizes="184px"
          priority={priority}
          className={cn('object-cover', MEDIA_ZOOM)}
        />

        {isYours && (
          <span className="absolute left-2 top-2 inline-flex h-6 items-center rounded-full bg-lime px-[9px] text-[11px] font-bold text-brand-ink">
            Yours
          </span>
        )}
      </span>

      {/* What it was posted against leads: a caption on its own does not say
          whether this was a community, a place or an experience */}
      {context && (
        <span className="flex min-w-0 items-center gap-1.5 text-[12.5px] font-semibold text-brand">
          <IconComponent
            iconName={CANVAS_ICONS[context.icon]}
            size={15}
            color="currentColor"
            className="flex-shrink-0"
          />
          <span className="truncate">{context.label}</span>
        </span>
      )}

      {preview && (
        <span className="text-[13px] font-medium leading-[1.45] text-gray-800">{preview}</span>
      )}

      <span className="text-xs text-ink-muted">{momentByline(moment)}</span>
    </button>
  );
};
