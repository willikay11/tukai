'use client';

import { useEffect, useState } from 'react';

import moment from 'moment';

import { attendedAgo } from '@/app/(profile)/hooks/calendar-agenda';
import { ReviewToWrite, WrittenReview } from '@/app/(profile)/hooks/useMyReviews';
import { LeaveReviewDrawer } from '@/app/shared/components/Experiences';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useExperienceDrawer } from '@/context/ExperienceDrawerContext';
import { ExperienceRatingPhoto, RATING_MAX, ratingPhotoUrl } from '@/types/experienceRating';

/** "Attended yesterday, {organiser}", or without one when there is none. */
const attendedLine = (when: string, organiser?: string): string => {
  const ago = `Attended ${attendedAgo(when)}`;
  return organiser ? `${ago}, ${organiser}` : ago;
};

const ToReviewCard = ({
  review,
  onTapStar,
}: {
  review: ReviewToWrite;
  onTapStar: (score: number) => void;
}) => (
  <article className="flex flex-col gap-2.5 rounded-xl bg-surface-brand px-4 pb-4 pt-3.5">
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[8px] bg-white">
        <PhotoImage src={review.image} alt="" fill sizes="48px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold leading-[1.3] text-brand-ink">
          {review.title}
        </div>
        <div className="truncate text-13 text-ink">{attendedLine(review.when, review.organiser)}</div>
      </div>
      <span className="flex-shrink-0 self-start rounded-full bg-lime px-[9px] text-[11.5px] font-bold leading-6 text-brand-ink">
        To review
      </span>
    </div>

    <div
      role="group"
      aria-label={`Rate ${review.title}`}
      className="-ml-2.5 flex items-center"
    >
      {Array.from({ length: RATING_MAX }).map((_, index) => {
        const value = index + 1;

        return (
          <button
            key={value}
            type="button"
            onClick={() => onTapStar(value)}
            aria-label={`Rate ${value} out of ${RATING_MAX}`}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-star-muted transition-colors hover:bg-white hover:text-brand active:scale-[0.92]"
          >
            <IconComponent iconName="StarIcon" size={26} color="currentColor" />
          </button>
        );
      })}
    </div>

    <p className="-mt-1 text-sm leading-[1.5] text-ink">How was it? Tap a star to start your review.</p>
  </article>
);

/**
 * A full-screen view of a review's own photos.
 *
 * Not built to any handoff's pixel values - every one of them calls the
 * gallery itself out of scope, with its own design still to come. This is
 * just enough to make "Open photo" and "See all" do something real.
 */
const PhotoGalleryModal = ({
  photos,
  index,
  title,
  onClose,
}: {
  photos: ExperienceRatingPhoto[];
  index: number;
  title: string;
  onClose: () => void;
}) => {
  const [current, setCurrent] = useState(index);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') setCurrent((value) => (value - 1 + photos.length) % photos.length);
      if (event.key === 'ArrowRight') setCurrent((value) => (value + 1) % photos.length);
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [photos.length, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[70] flex flex-col bg-black/90"
    >
      <div className="flex flex-shrink-0 items-center justify-between gap-3 px-4 py-3">
        <span className="truncate text-sm font-medium text-white/80">
          {title} · {current + 1} of {photos.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
        <div className="relative h-full w-full max-w-4xl">
          <PhotoImage
            src={ratingPhotoUrl(photos[current])}
            alt=""
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrent((value) => (value - 1 + photos.length) % photos.length)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
            >
              <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
            </button>
            <button
              type="button"
              onClick={() => setCurrent((value) => (value + 1) % photos.length)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
            >
              <IconComponent iconName="ArrowRight01Icon" size={20} color="currentColor" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const WrittenReviewCard = ({ review }: { review: WrittenReview }) => {
  const experienceDrawer = useExperienceDrawer();
  const photos = review.rating.photos ?? [];
  const rating = review.rating.rating;
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  return (
    <article className="flex flex-col gap-3 rounded-xl bg-surface px-4 pb-4 pt-3.5">
      <button
        type="button"
        onClick={() => experienceDrawer?.openExperience(review.experienceId)}
        className="flex min-w-0 items-center gap-3 text-left"
      >
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[8px] bg-surface-brand">
          <PhotoImage src={review.image} alt="" fill sizes="48px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold leading-[1.3] text-brand-ink">
            {review.title}
          </div>
          <div className="truncate text-13 text-ink-muted">
            {[review.organiser, moment(review.when).format('D MMM')].filter(Boolean).join(', ')}
          </div>
        </div>
      </button>

      <div className="flex items-center gap-2">
        <span role="img" aria-label={`You rated it ${rating} out of 5`} className="flex items-center gap-0.5">
          {Array.from({ length: RATING_MAX }).map((_, index) => (
            <IconComponent
              key={index}
              iconName="StarIcon"
              variant="bulk"
              size={17}
              color="currentColor"
              className={index < rating ? 'text-brand' : 'text-line'}
            />
          ))}
        </span>
        <span className="text-sm font-bold text-brand-ink">{rating}</span>
      </div>

      {review.rating.review && (
        <p className="text-[14.5px] leading-[1.55] text-gray-900">{review.rating.review}</p>
      )}

      {photos.length > 0 && (
        <div className="flex gap-2">
          {photos.slice(0, 3).map((photo, index) => {
            const overflow = index === 2 && photos.length > 3;

            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => setGalleryIndex(index)}
                aria-label={overflow ? `See all ${photos.length} photos` : `Open photo ${index + 1} of ${photos.length}`}
                className="relative h-[76px] w-[76px] flex-shrink-0 cursor-zoom-in overflow-hidden rounded-[8px] bg-surface-brand"
              >
                <PhotoImage src={ratingPhotoUrl(photo, 'thumb')} alt="" fill sizes="76px" className="object-cover" />
                {overflow && (
                  <span className="absolute inset-0 flex items-center justify-center bg-[rgba(1,26,27,0.55)] text-[15px] font-bold text-white">
                    +{photos.length - 3}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {galleryIndex !== null && (
        <PhotoGalleryModal
          photos={photos}
          index={galleryIndex}
          title={`Your photos from ${review.title}`}
          onClose={() => setGalleryIndex(null)}
        />
      )}
    </article>
  );
};

export const ReviewsTab = ({
  toReview,
  written,
}: {
  toReview: ReviewToWrite[];
  written: WrittenReview[];
}) => {
  const [target, setTarget] = useState<
    | { experienceId: string; title: string; image?: string; organiser?: string; when: string; score: number }
    | null
  >(null);

  return (
    <section aria-label="Reviews" className="flex min-w-0 flex-col gap-4">
      <div>
        <h2 className="text-19 font-bold tracking-[-0.3px] text-brand-ink">Reviews you wrote</h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">Only past experiences can be reviewed.</p>
      </div>

      {toReview.length === 0 && written.length === 0 ? (
        <p className="text-sm text-ink-subtle">Nothing here yet.</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(max(280px,(100%_-_16px)/2),1fr))] items-stretch gap-4">
          {toReview.map((review) => (
            <ToReviewCard
              key={review.experienceId}
              review={review}
              onTapStar={(score) =>
                setTarget({
                  experienceId: review.experienceId,
                  title: review.title,
                  image: review.image,
                  organiser: review.organiser,
                  when: review.when,
                  score,
                })
              }
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
          experienceImage={target.image}
          organiser={target.organiser}
          attendedWhen={target.when}
          initialScore={target.score}
          isOpen={Boolean(target)}
          onClose={() => setTarget(null)}
        />
      )}
    </section>
  );
};
