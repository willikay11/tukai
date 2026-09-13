'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import numeral from 'numeral';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { PhotoImage } from '@/app/shared/components/Images';
import { CARD_LIFT, MEDIA_ZOOM, TITLE_TINT } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { formatDateAndTimeRange } from '@/utils/date-utils';
import { communityPath, experiencePath } from '@/utils/detail-paths';

/**
 * An experience, shown under the community running it.
 *
 * The community leads because the section is about what is happening inside
 * the crews a reader follows — the experience is the news, the community is
 * the reason they are being told.
 */
export const CommunityHappeningCard = ({
  experience,
  priority = false,
}: {
  experience: Experience;
  priority?: boolean;
}) => {
  const { data: session } = useSession();

  const cover = coverPhotoUrl(experience.photos, 'md');
  const price = experience.priceStartsFrom;
  const community = experience.hostCommunity;

  return (
    <div className={cn('group w-full', CARD_LIFT)}>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
        <Link href={experiencePath(experience)} tabIndex={-1} aria-hidden="true">
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

        <Link href={experiencePath(experience)} className="block">
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
