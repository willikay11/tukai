'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useExperienceRatings } from '@/app/shared/hooks/useExperiences';
import { cn } from '@/lib/utils';
import {
  ExperienceRating,
  RATING_MAX,
  averageRating,
  ratingBreakdown,
  ratingPhotoUrl,
  ratingSummary,
} from '@/types/experienceRating';
import { linkedUserName } from '@/types/user';

/** How many reviews are shown before the rest are asked for. */
const FIRST_PAGE = 4;

const Stars = ({ score, size = 14 }: { score: number; size?: number }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${score} out of ${RATING_MAX}`}>
    {Array.from({ length: RATING_MAX }).map((_, index) => (
      <IconComponent
        key={index}
        iconName="StarIcon"
        variant="solid"
        size={size}
        color="currentColor"
        className={index < Math.round(score) ? 'text-yellow-400' : 'text-gray-200'}
      />
    ))}
  </span>
);

const ReviewRow = ({ review }: { review: ExperienceRating }) => {
  const photos = review.photos ?? [];

  return (
    <article className="border-b border-gray-100 py-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-line text-sm font-semibold text-ink"
        >
          {linkedUserName(review.attendee).charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {linkedUserName(review.attendee)}
          </p>
          <div className="flex items-center gap-2">
            <Stars score={Number(review.rating)} />
            {review.dateCreated && (
              <span className="text-xs text-gray-400">
                {moment(review.dateCreated).format('MMM YYYY')}
              </span>
            )}
          </div>
        </div>
      </div>

      {review.review && (
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{review.review}</p>
      )}

      {photos.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative h-20 w-20 overflow-hidden rounded-xl">
              <PhotoImage
                src={ratingPhotoUrl(photo, 'thumb')}
                alt={photo.caption ?? ''}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </article>
  );
};

/**
 * What attendees said.
 *
 * The experience serializers carry no average and no count, so both are worked
 * out from the ratings themselves. The endpoint needs a token and can refuse
 * outright, so a reader who is not signed in is simply not shown the section
 * rather than shown an error they cannot act on.
 */
export const ExperienceReviews = ({ experienceId }: { experienceId: string }) => {
  const { data: session } = useSession();
  const [showAll, setShowAll] = useState(false);

  const { data: response, isLoading } = useExperienceRatings(
    experienceId,
    Boolean(session?.user?.id),
  );

  const ratings: ExperienceRating[] = Array.isArray(response?.data) ? response.data : [];

  if (!session?.user?.id || isLoading) return null;

  const average = averageRating(ratings);
  const summary = ratingSummary(ratings);
  const visible = showAll ? ratings : ratings.slice(0, FIRST_PAGE);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xl font-bold text-gray-900">Reviews</p>
        {summary && (
          <span className="flex items-center gap-2 text-sm text-gray-600">
            <Stars score={average ?? 0} size={16} />
            {summary}
          </span>
        )}
      </div>

      {ratings.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">
          No one has reviewed this experience yet. Reviews open once it has happened.
        </p>
      ) : (
        <>
          {/* How the scores fall, which one average alone does not say */}
          <div className="mt-3 space-y-1">
            {ratingBreakdown(ratings).map(({ score, count }) => (
              <div key={score} className="flex items-center gap-2">
                <span className="w-3 text-xs text-gray-500">{score}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <span
                    className={cn('block h-full rounded-full bg-yellow-400')}
                    style={{ width: `${(count / ratings.length) * 100}%` }}
                  />
                </span>
                <span className="w-6 text-right text-xs text-gray-400">{count}</span>
              </div>
            ))}
          </div>

          <div className="mt-2">
            {visible.map((review) => (
              <ReviewRow key={review.id} review={review} />
            ))}
          </div>

          {ratings.length > FIRST_PAGE && !showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-2 text-sm font-medium text-brand transition-colors hover:underline"
            >
              Show all {ratings.length} reviews
            </button>
          )}
        </>
      )}
    </section>
  );
};
