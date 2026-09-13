'use client';

import { ChangeEvent, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useCreateMoment } from '@/app/shared/hooks/useMoments';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

// The API requires a title as well as a description, but the composer asks one
// question — the same as the mobile app. The first line stands in as the title,
// which is what a reader would call the moment anyway.
const TITLE_MAX = 60;

export const titleFrom = (text: string): string => {
  const [firstLine] = text.trim().split('\n');
  const title = (firstLine || text).trim();

  return title.length > TITLE_MAX ? `${title.slice(0, TITLE_MAX).trimEnd()}…` : title;
};

/**
 * Shares a moment at a place, a community or an experience.
 *
 * The context is fixed by whoever opens it — the experience page passes its own
 * id and title — so there is nothing to choose in here.
 */
export const MomentComposer = ({
  open,
  onOpenChange,
  contextLabel,
  experienceId,
  placeId,
  placeLabel,
  communityId,
  communityLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // What the moment is being posted at, for the chip under the author
  contextLabel: string;
  experienceId?: string;
  placeId?: string;
  // The place and community the experience belongs to. Named in the trail so
  // the reader can see where else the moment will surface, and their ids are
  // posted with it so it actually does.
  placeLabel?: string;
  communityId?: string;
  communityLabel?: string;
}) => {
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
  const canShare = text.trim().length > 0 && !isPending;

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

  const close = () => {
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setText('');
    setPhotos([]);
    onOpenChange(false);
  };

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
            description: `Your moment at ${contextLabel} is live.`,
            variant: 'success',
          });
          close();
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

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="w-[calc(100%-24px)] max-w-[520px] rounded-2xl p-6 md:max-w-[520px]">
        <DialogTitle className="text-lg font-bold text-gray-900">New Moment</DialogTitle>

        {/* Who is posting, and everywhere it lands: the experience, plus the
            place and community it belongs to */}
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="font-semibold text-gray-900">{author}</span>

          {[placeLabel, communityLabel].filter(Boolean).map((label) => (
            <span key={label} className="flex items-center gap-1.5">
              <IconComponent iconName="ArrowRight01Icon" size={14} className="text-gray-400" />
              <span className="text-xs text-gray-500">{label}</span>
            </span>
          ))}

          <IconComponent iconName="ArrowRight01Icon" size={14} className="text-gray-400" />
          <span className="rounded-full bg-green-200 px-3 py-1 text-xs font-medium text-primary">
            {contextLabel}
          </span>
        </div>

        {(placeLabel || communityLabel) && (
          <p className="-mt-2 text-xs text-gray-400">
            Shared with {[placeLabel, communityLabel].filter(Boolean).join(' and ')} too.
          </p>
        )}

        <Textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What are you up to?"
          aria-label="What are you up to?"
          rows={4}
          className="resize-none border-0 px-0 text-base focus-visible:ring-0"
        />

        {photos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {photos.map((photo, index) => (
              <div
                key={`${photo.file.name}-${index}`}
                className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-100"
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
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900/60 text-white"
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
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-800 hover:bg-gray-100"
            >
              <IconComponent iconName="Image02Icon" size={20} color="currentColor" />
            </button>

            {/* Capture only means anything on a phone, where it opens the
                camera; on a desktop it would just be a second file picker */}
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              aria-label="Take a photo"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-800 hover:bg-gray-100 md:hidden"
            >
              <IconComponent iconName="Camera01Icon" size={20} color="currentColor" />
            </button>
          </div>

          <Button
            variant="lime"
            onClick={handleShare}
            disabled={!canShare}
            isLoading={isPending}
            className="rounded-full px-6"
          >
            <IconComponent iconName="UserAdd01Icon" size={16} color="currentColor" />
            Share Moment
          </Button>
        </div>

        <input ref={galleryRef} type="file" accept="image/*" multiple hidden onChange={addPhotos} />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={addPhotos}
        />
      </DialogContent>
    </Dialog>
  );
};
