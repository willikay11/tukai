'use client';

import { useSession } from 'next-auth/react';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { IconComponent } from '@/app/shared/components/Icons';
import { Share } from '@/app/shared/components/Share';
import { Place } from '@/types/place';
import { placePath } from '@/utils/detail-paths';

/** The round grey disc each of the header's controls sits in. */
const DISC = 'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface';

export const PlaceDrawerHeader = ({
  place,
  onClose,
  title,
  onBack,
}: {
  place: Place;
  onClose: () => void;
  /** What the drawer is showing, where that is not the place itself. */
  title?: string;
  /** Given one, a back control takes the reader to the place again. */
  onBack?: () => void;
}) => {
  const { data: session } = useSession();

  return (
    <div className="flex items-start justify-between gap-4 px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={`Back to ${place.title}`}
            className={`${DISC} transition-colors hover:bg-surface-muted`}
          >
            <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
          </button>
        )}

        <h2 className="min-w-0 truncate text-[26px] font-bold leading-tight text-brand-ink">
          {title ?? place.title}
        </h2>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <div className={DISC}>
          <Share
            coverPhoto={place.photos?.[0]?.photo ?? ''}
            title={place.title}
            link={`${process.env.NEXT_PUBLIC_APP_URL}${placePath(place)}`}
            kind="place"
            variant="icon"
          />
        </div>

        <div className={DISC}>
          <Bookmark
            bookmarked={place.isBookmarked}
            userId={session?.user?.id}
            placeId={place.id}
            itemName={place.title}
            className="text-brand"
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${place.title}`}
          className={`${DISC} text-danger transition-colors hover:bg-danger-surface`}
        >
          <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
        </button>
      </div>
    </div>
  );
};
