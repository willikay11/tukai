'use client';

import { ChangeEvent, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useCreateMoment } from '@/app/shared/hooks/useMoments';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { titleFrom } from '@/utils/safe-text-utils';

export type MomentContextProps = {
  /**
   * What the moment is being posted at, for the trail under the author.
   *
   * Absent where there is nothing to post it at — the Discover tile has no
   * context of its own. `POST /moments/` needs only a title and description,
   * so an untagged moment is valid; the trail is simply not drawn.
   */
  contextLabel?: string;
  /** What kind of thing that is — "Community", "Place", "Experience". */
  contextKind?: string;
  experienceId?: string;
  placeId?: string;
  // The place and community the experience belongs to. Named in the trail so
  // the reader can see where else the moment will surface, and their ids are
  // posted with it so it actually does.
  placeLabel?: string;
  communityId?: string;
  communityLabel?: string;
};

/**
 * The body of the moment composer: who is posting, where it lands, what they
 * wrote and the photos with it.
 *
 * Separate from the dialog around it because the place drawer shows the same
 * form in place rather than opening a second panel over itself.
 */
export const MomentComposerForm = ({
  contextLabel,
  contextKind,
  experienceId,
  placeId,
  placeLabel,
  communityId,
  communityLabel,
  onDone,
}: MomentContextProps & { onDone: () => void }) => {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [text, setText] = useState('');
  // The preview url is made once per file and revoked when it goes, rather
  // than minted during render — which would leak one on every keystroke
  const [photos, setPhotos] = useState<{ file: File; previewUrl: string }[]>([]);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const { mutate: shareMoment, isPending } = useCreateMoment();

  const author = session?.user?.name ?? 'You';

  /**
   * A moment is a photo with a line under it — the feeds that show them are
   * photo-led, and one with no photo would be filtered straight back out. The
   * API would take it, so this is the product's rule rather than the API's.
   */
  const hasPhoto = photos.length > 0;
  const canShare = text.trim().length > 0 && hasPhoto && !isPending;

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

  const handleShare = () => {
    if (!canShare) return;

    shareMoment(
      {
        title: titleFrom(text),
        description: text.trim(),
        experienceId,
        placeId,
        communityId,
        photos: photos.map((photo) => photo.file),
      },
      {
        onSuccess: () => {
          toast({
            title: 'Moment shared',
            description: contextLabel
              ? `Your moment at ${contextLabel} is live.`
              : 'Your moment is live.',
            variant: 'success',
          });
          photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
          setText('');
          setPhotos([]);
          onDone();
        },
        onError: (error: Error) =>
          toast({
            title: 'Could not share this moment',
            description: error.message,
            variant: 'destructive',
          }),
      },
    );
  };

  const alsoLands = [placeLabel, communityLabel].filter(Boolean) as string[];

  return (
    <div className="space-y-5">
      {/* Who is posting, and everywhere it lands */}
      <div className="flex items-start gap-4">
        <span className="relative block h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-full bg-surface">
          <PhotoImage
            src={session?.user?.image}
            alt={author}
            fill
            sizes="72px"
            className="object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center text-lg font-medium text-gray-600">
                {author.charAt(0).toUpperCase()}
              </div>
            }
          />
        </span>

        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pt-3 text-[19px]">
          <span className="font-bold text-brand-ink">{author}</span>

          {contextLabel && (
            <>
              <IconComponent iconName="ArrowRight01Icon" size={18} className="text-ink-subtle" />
              <span className="font-semibold text-brand">{contextLabel}</span>
            </>
          )}

          {contextKind && (
            <>
              <IconComponent iconName="ArrowRight01Icon" size={18} className="text-ink-subtle" />
              <span className="text-ink-muted">{contextKind}</span>
            </>
          )}

          {alsoLands.map((label) => (
            <span key={label} className="flex items-center gap-2">
              <IconComponent iconName="ArrowRight01Icon" size={18} className="text-ink-subtle" />
              <span className="text-ink-muted">{label}</span>
            </span>
          ))}
        </div>
      </div>

      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="What are you up to?"
        aria-label="What are you up to?"
        rows={5}
        className="resize-none border-0 px-0 text-[19px] placeholder:text-ink-subtle focus-visible:ring-0"
      />

      {hasPhoto && (
        <div className="flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <div
              key={`${photo.file.name}-${index}`}
              className="relative h-20 w-20 overflow-hidden rounded-xl bg-surface"
            >
              {/* A plain img, not next/image: these are local blob: urls with
                  nothing for the optimizer to fetch */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.previewUrl}
                alt={photo.file.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                aria-label={`Remove ${photo.file.name}`}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-ink/70 text-white"
              >
                <IconComponent iconName="Cancel01Icon" size={10} color="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            aria-label="Add photos"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-brand-ink hover:bg-surface"
          >
            <IconComponent iconName="Image02Icon" size={22} color="currentColor" />
          </button>

          {/* Capture only means anything on a phone, where it opens the
              camera; on a desktop it would just be a second file picker */}
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            aria-label="Take a photo"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-brand-ink hover:bg-surface md:hidden"
          >
            <IconComponent iconName="Camera01Icon" size={22} color="currentColor" />
          </button>
        </div>

        <Button
          variant="lime"
          onClick={handleShare}
          disabled={!canShare}
          isLoading={isPending}
          className="h-12 rounded-full px-6 text-[15px] font-bold"
        >
          <IconComponent iconName="DashboardCircleAddIcon" size={20} color="currentColor" />
          Share moment
        </Button>
      </div>

      {!hasPhoto && <p className="text-[15px] text-ink-muted">Add at least one photo.</p>}

      {alsoLands.length > 0 && (
        <p className="text-[13px] text-ink-subtle">Shared with {alsoLands.join(' and ')} too.</p>
      )}

      <input ref={galleryRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={addPhotos}
      />
    </div>
  );
};
