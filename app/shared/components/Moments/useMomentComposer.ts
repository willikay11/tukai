'use client';

import { useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';

import { useCreateMoment } from '@/app/shared/hooks/useMoments';
import { useToast } from '@/app/shared/hooks/useToast';
import { Moment } from '@/types/moment';
import { titleFrom } from '@/utils/safe-text-utils';

export type MomentContextProps = {
  /**
   * What the moment is being posted at, for the attach tile that carries no
   * label of its own - see the per-kind fallback in `defaults` below.
   *
   * Absent where there is nothing to post it at - the Discover tile has no
   * context of its own. `POST /moments/` needs only a title and description,
   * so an untagged moment is valid; every tile simply opens empty.
   */
  contextLabel?: string;
  experienceId?: string;
  placeId?: string;
  // The place and community the experience belongs to. Named so the reader
  // can see where else the moment will surface, and their ids are posted
  // with it so it actually does.
  placeLabel?: string;
  communityId?: string;
  communityLabel?: string;
};

export interface DraftMomentPhoto {
  id: string;
  file: File;
  url: string;
}

export type AttachmentKind = 'experience' | 'community' | 'place';

export interface MomentAttachment {
  kind: AttachmentKind;
  id: string;
  label: string;
  /** Its cover photo, where one was picked from the picker (which knows it). */
  thumb?: string;
}

// In the order the published moment shows them
export const ATTACHMENT_KINDS: AttachmentKind[] = ['experience', 'community', 'place'];

const MAX_PHOTOS = 10;

/**
 * Everything the moment composer needs: the draft (caption, photos) and
 * what it is attached to - one experience, one community, one place at most,
 * matching what `POST /moments/` can actually take.
 *
 * Every entry point fixes an initial attachment per kind (or none); the
 * reader can still change or clear any of the three tiles themselves, via
 * `onSelectAttachment`/`onRemoveAttachment`, through the picker each empty
 * tile opens. An override replaces the caller's default for that kind until
 * the drawer is closed and reopened.
 */
export const useMomentComposer = (context: MomentContextProps, onDone: () => void) => {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [caption, setCaption] = useState('');
  const [photos, setPhotos] = useState<DraftMomentPhoto[]>([]);
  const [overrides, setOverrides] = useState<Partial<Record<AttachmentKind, MomentAttachment | null>>>(
    {},
  );
  // The moment just shared, opened in its own drawer in place of a toast - the
  // drawer is the confirmation that it is live
  const [sharedMoment, setSharedMoment] = useState<Moment | null>(null);

  const { mutate: shareMoment, isPending } = useCreateMoment();

  const author = session?.user?.name ?? 'You';

  // What the caller fixed, before any override - by kind, so a pick or a
  // remove can target one without touching the other two
  const defaults = useMemo((): Partial<Record<AttachmentKind, MomentAttachment>> => {
    const map: Partial<Record<AttachmentKind, MomentAttachment>> = {};

    if (context.experienceId) {
      map.experience = {
        kind: 'experience',
        id: context.experienceId,
        label: context.contextLabel || 'Experience',
      };
    }
    if (context.communityId) {
      map.community = {
        kind: 'community',
        id: context.communityId,
        label: context.communityLabel || context.contextLabel || 'Community',
      };
    }
    if (context.placeId) {
      map.place = {
        kind: 'place',
        id: context.placeId,
        label: context.placeLabel || context.contextLabel || 'Place',
      };
    }

    return map;
  }, [
    context.experienceId,
    context.communityId,
    context.placeId,
    context.contextLabel,
    context.communityLabel,
    context.placeLabel,
  ]);

  const attachmentFor = (kind: AttachmentKind): MomentAttachment | null =>
    kind in overrides ? (overrides[kind] ?? null) : (defaults[kind] ?? null);

  const attachments = ATTACHMENT_KINDS.map(attachmentFor).filter(
    (attachment): attachment is MomentAttachment => attachment !== null,
  );

  const onSelectAttachment = (kind: AttachmentKind, attachment: Omit<MomentAttachment, 'kind'>) =>
    setOverrides((previous) => ({ ...previous, [kind]: { kind, ...attachment } }));

  const onRemoveAttachment = (kind: AttachmentKind) =>
    setOverrides((previous) => ({ ...previous, [kind]: null }));

  /**
   * A moment is a photo with a line under it - the feeds that show them are
   * photo-led, and one with no photo would be filtered straight back out.
   */
  const hasPhoto = photos.length > 0;
  const canShare = caption.trim().length > 0 && hasPhoto && !isPending;

  const onAddPhotos = (files: File[]) => {
    if (files.length === 0) return;

    const room = MAX_PHOTOS - photos.length;

    if (room <= 0) {
      toast({ description: `You can add up to ${MAX_PHOTOS} photos.` });
      return;
    }

    const accepted = files.slice(0, room);

    if (files.length > accepted.length) {
      toast({
        description: `You can add up to ${MAX_PHOTOS} photos. The first ${accepted.length} were added.`,
      });
    }

    setPhotos((previous) => [
      ...previous,
      ...accepted.map((file) => ({
        id: `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        url: URL.createObjectURL(file),
      })),
    ]);
  };

  const onRemovePhoto = (id: string) =>
    setPhotos((previous) => {
      const target = previous.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return previous.filter((photo) => photo.id !== id);
    });

  const onMovePhoto = (id: string, direction: -1 | 1) =>
    setPhotos((previous) => {
      const index = previous.findIndex((photo) => photo.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= previous.length) return previous;

      const next = [...previous];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const onReorderPhotos = (fromIndex: number, toIndex: number) =>
    setPhotos((previous) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return previous;
      const next = [...previous];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return previous;
      next.splice(toIndex, 0, moved);
      return next;
    });

  const resetDraft = () => {
    photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    setCaption('');
    setPhotos([]);
    setOverrides({});
  };

  const handleShare = () => {
    if (!canShare) return;

    const experienceId = attachments.find((attachment) => attachment.kind === 'experience')?.id;
    const communityId = attachments.find((attachment) => attachment.kind === 'community')?.id;
    const placeId = attachments.find((attachment) => attachment.kind === 'place')?.id;

    shareMoment(
      {
        title: titleFrom(caption),
        description: caption.trim(),
        experienceId,
        placeId,
        communityId,
        photos: photos.map((photo) => photo.file),
      },
      {
        // The newly posted moment opens in its own drawer - that is the
        // confirmation, so there is no toast on top of it
        onSuccess: (response) => {
          resetDraft();
          onDone();
          setSharedMoment((response?.data as Moment) ?? null);
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

  return {
    author,
    authorImage: session?.user?.image,
    caption,
    onCaptionChange: setCaption,
    photos,
    onAddPhotos,
    onRemovePhoto,
    onMovePhoto,
    onReorderPhotos,
    attachments,
    attachmentFor,
    onSelectAttachment,
    onRemoveAttachment,
    hasPhoto,
    canShare,
    isPending,
    handleShare,
    sharedMoment,
    onCloseSharedMoment: () => setSharedMoment(null),
  };
};
