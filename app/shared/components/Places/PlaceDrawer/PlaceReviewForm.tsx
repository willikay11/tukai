'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import {
  useCreatePlaceReview,
  useDeletePlaceReviewImage,
  useUploadPlaceReviewImages,
} from '@/app/shared/hooks/usePlaces';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { coverPhotoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { titleFrom } from '@/utils/safe-text-utils';

const STARS = [1, 2, 3, 4, 5];

/** What the API's own schema asks for before it will take a review. */
const MIN_REVIEW_LENGTH = 2;

/** What each score is called once it is picked. Exported so a test can follow
 *  the wording rather than pin a copy of it. */
export const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

/**
 * Writing a review, in the place drawer rather than over it.
 *
 * Deliberately not the shared {@link AddReview}: that one opens a Drawer of its
 * own, which would be a drawer inside a drawer, and asks for a title and a
 * description as two fields. This asks one question, as the design does, and
 * the title is taken from the first line — the API wants both.
 */
export const PlaceReviewForm = ({ place, onDone }: { place: Place; onDone: () => void }) => {
  const { data: session } = useSession();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<{ file: File; previewUrl: string }[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const { mutate: createReview, isPending, isSuccess, data: created } = useCreatePlaceReview();
  const { mutate: uploadImages, isSuccess: isUploaded } = useUploadPlaceReviewImages();
  useDeletePlaceReviewImage();

  const shown = hovered || rating;
  const canPost = rating > 0 && text.trim().length >= MIN_REVIEW_LENGTH && !isPending;

  const addPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(event.target.files ?? []);
    // Clearing lets the same file be picked again after a removal
    event.target.value = '';

    setPhotos((current) => [
      ...current,
      ...chosen.map((file) => ({ file, previewUrl: URL.createObjectURL(file) })),
    ]);
  };

  const removePhoto = (index: number) =>
    setPhotos((current) => {
      URL.revokeObjectURL(current[index].previewUrl);
      return current.filter((_, position) => position !== index);
    });

  const post = () => {
    if (!canPost) return;

    createReview({
      placeId: place.id,
      data: {
        place_id: place.id,
        title: titleFrom(text),
        description: text.trim(),
        rating,
        reviewer_id: session?.user?.id,
      },
    });
  };

  // Photos upload against the review the create call returns, so they can only
  // go once it has
  useEffect(() => {
    if (!isSuccess) return;

    const reviewId = created?.data?.id;

    if (!reviewId || photos.length === 0) {
      onDone();
      return;
    }

    photos.forEach((photo, index) => {
      const formData = new FormData();
      formData.append('photo', photo.file);
      formData.append('place', place.id);
      if (index === 0) formData.append('is_cover', 'true');
      uploadImages({ placeId: place.id, reviewId, data: formData });
    });
    // onDone waits for the upload below
  }, [isSuccess]);

  useEffect(() => {
    if (isUploaded) onDone();
  }, [isUploaded]);

  // Every object URL made above is released when the form goes
  useEffect(
    () => () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    },
    [photos],
  );

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center gap-4">
        <span className="relative block h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-xl bg-surface">
          <PhotoImage
            src={coverPhotoUrl(place.photos, 'thumb')}
            alt={place.title}
            fill
            sizes="72px"
            className="object-cover"
          />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[19px] font-bold text-brand-ink">{place.title}</p>
          {place.location?.city && (
            <p className="truncate text-[15px] text-ink-muted">{place.location.city}</p>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-[22px] font-bold text-brand-ink">How was your visit?</h3>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1" onMouseLeave={() => setHovered(0)}>
            {STARS.map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                aria-pressed={rating === star}
                className="p-1 transition-transform hover:scale-110"
              >
                <IconComponent
                  iconName="StarIcon"
                  size={34}
                  variant="solid"
                  color="currentColor"
                  className={star <= shown ? 'text-star' : 'text-surface-muted'}
                />
              </button>
            ))}
          </div>

          <span
            className={cn('text-[15px]', rating ? 'font-semibold text-gray-800' : 'text-ink-muted')}
          >
            {rating ? RATING_LABELS[rating] : 'Tap a star to rate'}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="place-review" className="text-[17px] font-bold text-brand-ink">
          Your review
        </label>
        <Textarea
          id="place-review"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What stood out? The food, the service, the room..."
          rows={10}
          className="mt-3 resize-none rounded-xl border-line text-[15px]"
        />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="inline-flex h-12 items-center gap-2.5 rounded-full bg-surface px-5 text-[15px] font-semibold text-brand-ink transition-colors hover:bg-surface-muted"
        >
          <IconComponent iconName="ImageAdd02Icon" size={20} color="currentColor" />
          Add photos
        </button>

        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          onChange={addPhotos}
          className="hidden"
          aria-label="Add photos to your review"
        />

        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {photos.map((photo, index) => (
              <div key={photo.previewUrl} className="relative">
                {/* The preview is an object URL, which next/image cannot
                    optimise and should not try to */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.previewUrl} alt="" className="h-20 w-20 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-ink text-white"
                >
                  <IconComponent iconName="Cancel01Icon" size={12} color="currentColor" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[15px] text-ink-muted">Reviews are public and show your name and photo.</p>

      <Button
        type="button"
        onClick={post}
        disabled={!canPost}
        variant={canPost ? 'gradient' : 'ghost'}
        className={cn(
          'h-12 w-full rounded-full text-[15px] font-bold',
          !canPost && 'bg-surface-brand text-ink-subtle hover:bg-surface-brand',
        )}
      >
        {isPending ? 'Posting…' : 'Post review'}
      </Button>
    </div>
  );
};
