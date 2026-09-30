'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useCreateExperienceRating } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { RATING_MAX } from '@/types/experienceRating';

const SCORE_WORD: Record<number, string> = {
  1: 'Not for me',
  2: 'It was fine',
  3: 'Good',
  4: 'Really good',
  5: 'Loved it',
};

/**
 * Leaving a review, with the photos on the same request.
 *
 * The score is the only required part: the API takes a rating with no words.
 * Whether this reader may review at all is the API's to decide, so a refusal is
 * shown as it was given rather than guessed at beforehand.
 */
export const LeaveReviewDrawer = ({
  experienceId,
  experienceTitle,
  isOpen,
  onClose,
}: {
  experienceId: string;
  experienceTitle: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const [score, setScore] = useState(0);
  const [words, setWords] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createRating, isPending } = useCreateExperienceRating(experienceId);

  const close = () => {
    setScore(0);
    setWords('');
    setPhotos([]);
    setError(null);
    onClose();
  };

  const submit = () => {
    setError(null);

    if (score === 0) {
      setError('Choose a score from one to five.');
      return;
    }

    createRating(
      { rating: score, review: words.trim() || undefined, photos },
      {
        onSuccess: () => {
          toast({
            title: 'Thank you',
            description: `Your review of ${experienceTitle} is posted.`,
            variant: 'success',
          });
          close();
        },
        // The API says which rule was broken — not an attendee, already rated,
        // or not ended — and that is more use than anything invented here
        onError: (failure: Error) => setError(failure.message),
      },
    );
  };

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && close()} width="narrow">
      <div className="flex min-h-full flex-col">
        <div className="flex items-center gap-3 border-b border-line px-6 py-4">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-brand"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
          </button>
          <h2 className="text-19 font-bold tracking-tight text-gray-900">Leave a review</h2>
        </div>

        <div className="flex flex-1 flex-col gap-6 px-6 py-6">
          <div className="flex flex-col gap-2.5">
            <span id="review-score" className="text-15 font-semibold text-gray-900">
              How was {experienceTitle}?
            </span>

            <div
              role="radiogroup"
              aria-labelledby="review-score"
              className="flex items-center gap-1"
            >
              {Array.from({ length: RATING_MAX }).map((_, index) => {
                const value = index + 1;

                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={score === value}
                    aria-label={`${value} out of ${RATING_MAX}`}
                    onClick={() => {
                      setScore(value);
                      setError(null);
                    }}
                    className="p-1"
                  >
                    <IconComponent
                      iconName="StarIcon"
                      variant="solid"
                      size={30}
                      color="currentColor"
                      className={value <= score ? 'text-yellow-400' : 'text-gray-200'}
                    />
                  </button>
                );
              })}
            </div>

            {score > 0 && <span className="text-13 text-ink-muted">{SCORE_WORD[score]}</span>}
          </div>

          <div className="flex flex-col gap-2.5">
            <label htmlFor="review-words" className="text-15 font-semibold text-gray-900">
              Anything you want to add?{' '}
              <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <Textarea
              id="review-words"
              value={words}
              onChange={(event) => setWords(event.target.value)}
              rows={5}
              placeholder="What should the next person know?"
              className="rounded-14 border-line text-15"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-15 font-semibold text-gray-900">
              Photos <span className="font-normal text-ink-muted">(optional)</span>
            </span>

            <label
              className={cn(
                'flex h-12 cursor-pointer items-center justify-center gap-2 rounded-14 border border-dashed border-line text-15 text-ink transition-colors hover:bg-surface',
              )}
            >
              <IconComponent iconName="ImageAdd02Icon" size={20} color="currentColor" />
              Add photos
              <input
                type="file"
                accept="image/*"
                multiple
                aria-label="Add photos"
                className="hidden"
                onChange={(event) =>
                  setPhotos((current) => [...current, ...Array.from(event.target.files ?? [])])
                }
              />
            </label>

            {photos.length > 0 && (
              <ul className="flex flex-col gap-1">
                {photos.map((photo, index) => (
                  <li
                    key={`${photo.name}-${index}`}
                    className="flex items-center gap-2 rounded-10 bg-surface px-3 py-2 text-13 text-ink"
                  >
                    <span className="min-w-0 flex-1 truncate">{photo.name}</span>
                    <button
                      type="button"
                      onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                      aria-label={`Remove ${photo.name}`}
                      className="text-ink-subtle transition-colors hover:text-danger"
                    >
                      <IconComponent iconName="CancelCircleIcon" size={18} color="currentColor" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && (
            <p role="alert" className="text-13 text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          <Button type="button" variant="ghost" onClick={close} className="text-danger">
            Cancel
          </Button>
          <Button
            type="button"
            variant="lime"
            onClick={submit}
            isLoading={isPending}
            className="rounded-full px-6"
          >
            Post review
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
