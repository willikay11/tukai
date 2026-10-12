'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import numeral from 'numeral';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { PhotoImage } from '@/app/shared/components/Images';
import { CARD_LIFT, MEDIA_ZOOM, TITLE_TINT } from '@/app/shared/components/Motion';
import { useExperienceDrawer } from '@/context/ExperienceDrawerContext';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { formatDateAndTimeRange } from '@/utils/date-utils';
import { communityPath, experiencePath } from '@/utils/detail-paths';

/**
 * An experience, shown under the community running it.
 *
 * The community leads because the section is about what is happening inside
 * the crews a reader follows - the experience is the news, the community is
 * the reason they are being told.
 *
 * A plain click opens the experience in the drawer, the same pattern
 * ExperienceCard follows - this page is never itself a drawer, so there is no
 * nesting concern stopping it here the way there is in the place drawer's own
 * cards.
 */
export const CommunityHappeningCard = ({
  experience,
  priority = false,
}: {
  experience: Experience;
  priority?: boolean;
}) => {
  const { data: session } = useSession();
  const drawer = useExperienceDrawer();

  const cover = coverPhotoUrl(experience.photos, 'md');
  const price = experience.priceStartsFrom;
  const community = experience.hostCommunity;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    // A modifier asks the browser for something else - a new tab, a new
    // window - and the link should do that rather than the drawer
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!drawer) return;

    event.preventDefault();
    event.stopPropagation();
    // nextjs-toploader's click listener and React's own delegated listener
    // are both on `document` - siblings, not ancestor and descendant - so
    // `stopPropagation()` alone cannot stop it. See the identical note in
    // ExperienceCard.
    event.nativeEvent.stopImmediatePropagation();
    drawer.openExperience(experience.id);
  };

  return (
    <div className={cn('group w-full', CARD_LIFT)}>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
        <Link
          href={experiencePath(experience)}
          tabIndex={-1}
          aria-hidden="true"
          onClick={handleOpen}
        >
          <PhotoImage
            src={cover}
            alt={experience.title}
            fill
            sizes="(max-width: 640px) 90vw, 300px"
            priority={priority}
            className={cn('object-cover', MEDIA_ZOOM)}
          />
        </Link>

        <div className="absolute right-2 top-2">
          <Bookmark
            bookmarked={experience.isBookmarked}
            userId={session?.user?.id}
            experienceId={experience.id}
            itemName={experience.title}
            className="text-white"
          />
        </div>
      </div>

      <div className="mt-3">
        {community && (
          <Link
            href={communityPath(community)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {community.title}
          </Link>
        )}

        <Link href={experiencePath(experience)} className="block" onClick={handleOpen}>
          <p className={cn('mt-0.5 text-base font-bold text-gray-900', TITLE_TINT)}>
            {experience.title}
          </p>

          <p className="mt-0.5 text-sm text-gray-500">
            {price?.amount ? (
              <>
                from{' '}
                <span className="font-semibold text-gray-900">
                  {price.currency} {numeral(price.amount).format('0,0')}
                </span>
              </>
            ) : (
              <span className="font-semibold text-gray-900">Free</span>
            )}
          </p>

          {experience.startDate && (
            <p className="mt-0.5 text-sm text-gray-400">
              {formatDateAndTimeRange(experience.startDate, experience.endDate)}
            </p>
          )}
        </Link>
      </div>
    </div>
  );
};
