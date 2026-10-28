'use client';

import { useState } from 'react';

import moment from 'moment';

import { ReviewToWrite, WrittenReview } from '@/app/(profile)/hooks/useMyReviews';
import { LeaveReviewDrawer } from '@/app/shared/components/Experiences';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { RATING_MAX, ratingPhotoUrl } from '@/types/experienceRating';

const ToReviewCard = ({
  review,
  onTapStar,
}: {
  review: ReviewToWrite;
  onTapStar: (score: number) => void;
}) => (
  <div className="flex flex-col gap-3 rounded-xl bg-white p-3.5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
        <PhotoImage src={review.image} alt="" fill sizes="56px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold text-brand-ink">{review.title}</div>
        <div className="mt-0.5 text-13 text-ink-muted">{moment(review.when).fromNow()}</div>
      </div>
      <span className="flex-shrink-0 rounded-full bg-surface px-2.5 py-1 text-[11.5px] font-semibold text-ink-muted">
        To review
      </span>
    </div>

    <div className="flex items-center justify-between gap-3">
      <span className="text-13 text-ink-muted">How was it? Tap a star to start your review.</span>
      <div className="flex flex-shrink-0 items-center">
        {Array.from({ length: RATING_MAX }).map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onTapStar(index + 1)}
            aria-label={`Rate ${index + 1} out of ${RATING_MAX}`}
            className="flex h-11 w-11 items-center justify-center"
          >
            <IconComponent iconName="StarIcon" size={22} color="currentColor" className="text-star-muted" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

const WrittenReviewCard = ({ review }: { review: WrittenReview }) => {
  const photos = review.rating.photos ?? [];

  return (
    <div className="flex gap-3.5 rounded-xl bg-white p-3.5 shadow-sm">
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
        <PhotoImage src={review.image} alt="" fill sizes="56px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold leading-[1.35] text-brand-ink">
              {review.title}
            </div>
            <div className="mt-0.5 text-13 text-ink-muted">{moment(review.when).format('MMM YYYY')}</div>
          </div>
          <span className="flex flex-shrink-0 items-center gap-1 text-sm font-bold text-brand-ink">
            <IconComponent iconName="StarIcon" variant="bulk" size={16} color="currentColor" className="text-brand" />
            {review.rating.rating}
          </span>
        </div>

        {review.rating.review && (
          <p className="mt-2 text-[14.5px] leading-[1.55] text-gray-900">{review.rating.review}</p>
        )}

        {photos.length > 0 && (
          <div className="mt-2.5 flex gap-1.5 overflow-x-auto">
            {photos.slice(0, 4).map((photo, index) => {
              const isLast = index === 3 && photos.length > 4;

              return (
                <div
                  key={photo.id}
                  className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface-brand"
                >
                  <PhotoImage src={ratingPhotoUrl(photo)} alt="" fill sizes="56px" className="object-cover" />
                  {isLast && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
                      +{photos.length - 4}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const ReviewsTab = ({
  toReview,
  written,
}: {
  toReview: ReviewToWrite[];
  written: WrittenReview[];
}) => {
  const [target, setTarget] = useState<{ experienceId: string; title: string; score: number } | null>(
    null,
  );

  return (
    <div>
      <h2 className="text-19 font-bold tracking-[-0.3px] text-brand-ink">Reviews you wrote</h2>
      <p className="mt-1 text-[13.5px] text-ink-muted">Only past experiences can be reviewed.</p>

      {toReview.length === 0 && written.length === 0 ? (
        <p className="mt-3.5 text-sm text-ink-subtle">Nothing here yet.</p>
      ) : (
        <div className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(max(280px,(100%_-_16px)/2),1fr))] items-stretch gap-4">
          {toReview.map((review) => (
            <ToReviewCard
              key={review.experienceId}
              review={review}
              onTapStar={(score) => setTarget({ experienceId: review.experienceId, title: review.title, score })}
            />
          ))}
          {written.map((review) => (
            <WrittenReviewCard key={review.experienceId} review={review} />
          ))}
        </div>
      )}

      {target && (
        <LeaveReviewDrawer
          experienceId={target.experienceId}
          experienceTitle={target.title}
          initialScore={target.score}
          isOpen={Boolean(target)}
          onClose={() => setTarget(null)}
        />
      )}
    </div>
  );
};
