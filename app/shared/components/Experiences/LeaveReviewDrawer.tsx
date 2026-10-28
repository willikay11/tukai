'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { attendedAgo } from '@/app/(profile)/hooks/calendar-agenda';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useCreateExperienceRating } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { RATING_MAX } from '@/types/experienceRating';

const RATING_LABEL: Record<number, string> = {
  0: 'Tap a star to rate',
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};

const TEXT_MAX = 500;
const PHOTOS_MAX = 6;

const missingHint = (score: number, text: string): string | null => {
  const hasScore = score > 0;
  const hasText = text.trim().length > 0;

  if (hasScore && hasText) return null;
  if (!hasScore && !hasText) return 'Pick a star rating and add a few words.';
  return hasScore ? 'Add a few words about what it was like.' : 'Pick a star rating.';
};

/** A full-width rule between composer sections, matching the panel's own padding. */
const Divider = () => <div aria-hidden="true" className="h-px flex-shrink-0 bg-line-shell" />;

/**
 * Leaving a review.
 *
 * There is no edit mode: the API has no way to update or delete a rating once
 * posted (only `POST .../ratings/` exists), so a written review never opens
 * this composer again - the Reviews tab leaves it read-only. For the same
 * reason there is no "What stood out?" (the API has no field for it) and no
 * TukAI writing help (there is no endpoint that writes one).
 */
export const LeaveReviewDrawer = ({
  experienceId,
  experienceTitle,
  experienceImage,
  organiser,
  attendedWhen,
  isOpen,
  onClose,
  initialScore = 0,
}: {
  experienceId: string;
  experienceTitle: string;
  experienceImage?: string;
  organiser?: string;
  attendedWhen?: string;
  isOpen: boolean;
  onClose: () => void;
  /** Preset when a caller already knows the score, such as a tapped star. */
  initialScore?: number;
}) => {
  const { toast } = useToast();
  const [score, setScore] = useState(initialScore);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createRating, isPending } = useCreateExperienceRating(experienceId);

  const ready = score > 0 && text.trim().length > 0;
  const hint = missingHint(score, text);

  const blobUrls = useRef<Map<File, string>>(new Map());
  const getBlobUrl = useCallback((file: File): string => {
    if (!blobUrls.current.has(file)) {
      blobUrls.current.set(file, URL.createObjectURL(file));
    }
    return blobUrls.current.get(file)!;
  }, []);

  useEffect(() => {
    const urls = blobUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const close = () => {
    setScore(0);
    setText('');
    setPhotos([]);
    setError(null);
    onClose();
  };

  const submit = () => {
    if (!ready) return;
    setError(null);

    createRating(
      { rating: score, review: text.trim(), photos },
      {
        onSuccess: () => {
          toast({
            title: 'Review posted',
            description: `Thanks for sharing what ${experienceTitle} was like.`,
            variant: 'success',
          });
          close();
        },
        // The API says which rule was broken - not an attendee, already rated,
        // or not ended - and that is more use than anything invented here
        onError: (failure: Error) => setError(failure.message),
      },
    );
  };

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && close()} ariaLabel="New review">
      <div className="flex min-h-full flex-col">
        <div className="flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-[24px] font-bold tracking-[-0.4px] text-gray-900">
            New review
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-danger transition-colors hover:bg-danger-surface"
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-7 px-6 pb-9 pt-5">
          <div className="flex items-center gap-3.5">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
              <PhotoImage src={experienceImage} alt="" fill sizes="64px" className="object-cover" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-base font-semibold text-gray-900">{experienceTitle}</span>
              {attendedWhen && (
                <span className="text-sm text-ink-muted">
                  {`Attended ${attendedAgo(attendedWhen)}${organiser ? `, ${organiser}` : ''}`}
                </span>
              )}
            </div>
          </div>

          <Divider />

          <div className="flex flex-col gap-2.5">
            <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-900">How was it?</h3>

            <div
              role="group"
              aria-label="Your rating"
              className="-ml-1.5 flex flex-wrap items-center gap-0.5"
            >
              {Array.from({ length: RATING_MAX }).map((_, index) => {
                const value = index + 1;
                const selected = value <= score;

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
                    onClick={() => {
                      setScore(value);
                      setError(null);
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-colors hover:bg-surface active:scale-[0.92]"
                  >
                    <IconComponent
                      iconName="StarIcon"
                      variant="bulk"
                      size={32}
                      color="currentColor"
                      className={selected ? 'text-rating' : 'text-line'}
                    />
                  </button>
                );
              })}
              <span aria-live="polite" className="ml-2.5 text-[14.5px] font-semibold text-gray-900">
                {RATING_LABEL[score]}
              </span>
            </div>
          </div>

          <Divider />

          <div className="flex flex-col gap-2.5">
            <div className="flex items-baseline gap-2.5">
              <label htmlFor="review-text" className="text-[15px] font-semibold text-gray-900">
                Your review
              </label>
              <span className="text-13 text-ink-muted">
                {text.length}/{TEXT_MAX}
              </span>
            </div>
            <textarea
              id="review-text"
              value={text}
              onChange={(event) => {
                setText(event.target.value.slice(0, TEXT_MAX));
                setError(null);
              }}
              rows={6}
              placeholder="What was it like? The host, the pace, the group..."
              className="w-full resize-y rounded-xl border border-line bg-white px-4 py-3.5 text-[15px] leading-normal text-gray-900 outline-none placeholder:text-ink-subtle focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
            />
          </div>

          <Divider />

          <div className="flex flex-col gap-3">
            <span className="text-[15px] font-semibold text-gray-900">
              Photos <span className="font-normal text-ink-muted">(optional, up to {PHOTOS_MAX})</span>
            </span>

            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <span
                  key={`${photo.name}-${index}`}
                  className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl bg-surface"
                >
                  <PhotoImage
                    src={getBlobUrl(photo)}
                    alt=""
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const url = blobUrls.current.get(photo);
                      if (url) {
                        URL.revokeObjectURL(url);
                        blobUrls.current.delete(photo);
                      }
                      setPhotos((current) => current.filter((_, i) => i !== index));
                    }}
                    aria-label={`Remove ${photo.name}`}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-white"
                  >
                    <IconComponent iconName="Cancel01Icon" size={12} color="currentColor" />
                  </button>
                </span>
              ))}

              {photos.length < PHOTOS_MAX && (
                <label
                  className={cn(
                    'flex h-[72px] w-[72px] flex-shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line text-ink-muted transition-colors hover:bg-surface',
                  )}
                >
                  <IconComponent iconName="ImageAdd02Icon" size={20} color="currentColor" />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    aria-label="Add photos"
                    className="hidden"
                    onChange={(event) =>
                      setPhotos((current) =>
                        [...current, ...Array.from(event.target.files ?? [])].slice(0, PHOTOS_MAX),
                      )
                    }
                  />
                </label>
              )}
            </div>
          </div>

          <p className="text-13 leading-[1.5] text-ink-muted">
            Reviews are public and show your name and photo. Only people who attended can review.
          </p>

          {hint && (
            <p className="-mt-2 flex items-start gap-2 text-[13.5px] leading-[1.5] text-ink-muted">
              <IconComponent
                iconName="InformationCircleIcon"
                size={17}
                color="currentColor"
                className="mt-px flex-shrink-0 text-brand"
              />
              {hint}
            </p>
          )}

          {error && (
            <p role="alert" className="text-13 text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 z-10 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
          <button
            type="button"
            onClick={close}
            className="h-12 px-1.5 text-[15px] font-medium text-danger hover:underline"
          >
            Cancel
          </button>

          <span aria-hidden="true" className="flex-1" />

          <button
            type="button"
            onClick={submit}
            disabled={!ready || isPending}
            aria-disabled={!ready}
            className="h-12 whitespace-nowrap rounded-full bg-lime px-6 text-[15px] font-semibold text-brand-ink enabled:hover:bg-lime-dark disabled:bg-[#E4F4B5] disabled:text-[#5E7A45]"
          >
            {isPending ? 'Posting…' : 'Post review'}
          </button>
        </div>
      </div>
    </Drawer>
  );
};
