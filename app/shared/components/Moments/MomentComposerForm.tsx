'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Textarea } from '@/components/ui/textarea';

import { MomentAttachPicker } from './MomentAttachPicker';
import { MomentAttachTile } from './MomentAttachTile';
import { MomentPhotosField } from './MomentPhotosField';
import type { MomentAttachOption } from './useMomentAttachSearch';
import {
  ATTACHMENT_KINDS,
  type AttachmentKind,
  type DraftMomentPhoto,
  type MomentAttachment,
} from './useMomentComposer';

export interface MomentComposerFormProps {
  author: string;
  authorImage?: string | null;
  caption: string;
  onCaptionChange: (value: string) => void;
  photos: DraftMomentPhoto[];
  onAddPhotos: (files: File[]) => void;
  onRemovePhoto: (id: string) => void;
  onMovePhoto: (id: string, direction: -1 | 1) => void;
  onReorderPhotos: (fromIndex: number, toIndex: number) => void;
  attachmentFor: (kind: AttachmentKind) => MomentAttachment | null;
  onSelectAttachment: (kind: AttachmentKind, attachment: Omit<MomentAttachment, 'kind'>) => void;
  onRemoveAttachment: (kind: AttachmentKind) => void;
  hasPhoto: boolean;
}

/**
 * The body of the moment composer: who is posting, the photos, the caption
 * and whatever it is attached to - everything but the Cancel/Share buttons,
 * which the drawer shell (or whatever embeds this inline) owns, since each
 * puts them somewhere different.
 */
export const MomentComposerForm = ({
  author,
  authorImage,
  caption,
  onCaptionChange,
  photos,
  onAddPhotos,
  onRemovePhoto,
  onMovePhoto,
  onReorderPhotos,
  attachmentFor,
  onSelectAttachment,
  onRemoveAttachment,
  hasPhoto,
}: MomentComposerFormProps) => {
  const [openPickerKind, setOpenPickerKind] = useState<AttachmentKind | null>(null);

  const needLine = !hasPhoto
    ? 'Add at least one photo.'
    : caption.trim().length === 0
      ? 'Say something about this moment.'
      : null;

  const selectAttachment = (kind: AttachmentKind, option: MomentAttachOption) => {
    onSelectAttachment(kind, { id: option.id, label: option.label });
    setOpenPickerKind(null);
  };

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center gap-3">
        <span className="relative block h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-surface">
          <PhotoImage
            src={authorImage}
            alt={author}
            fill
            sizes="44px"
            className="object-cover"
            fallback={
              <div className="flex h-full w-full items-center justify-center text-base font-medium text-gray-600">
                {author.charAt(0).toUpperCase()}
              </div>
            }
          />
        </span>

        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-base font-semibold text-gray-900">{author}</span>
          <span className="flex items-center gap-1.5 text-[13.5px] leading-tight text-ink-muted">
            <IconComponent
              iconName="Globe02Icon"
              size={16}
              color="currentColor"
              className="flex-shrink-0 text-brand"
            />
            Anyone on Tukai can see this moment.
          </span>
        </div>
      </div>

      <MomentPhotosField
        photos={photos}
        onAdd={onAddPhotos}
        onRemove={onRemovePhoto}
        onReorder={onReorderPhotos}
        onMove={onMovePhoto}
      />

      <label className="flex flex-col gap-2.5">
        <span className="text-[15px] font-semibold text-gray-800">Caption</span>
        <Textarea
          value={caption}
          onChange={(event) => onCaptionChange(event.target.value)}
          placeholder="What was it like?"
          aria-label="Caption"
          rows={3}
          className="min-h-[104px] rounded-xl border-line focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_#E8F1ED]"
        />
      </label>

      <div className="flex flex-col gap-3">
        <span className="text-[15px] font-semibold text-gray-800">
          Where did this moment take place?
        </span>

        <div className="grid grid-cols-3 gap-2.5" role="list" aria-label="Attached to">
          {ATTACHMENT_KINDS.map((kind) => (
            <MomentAttachTile
              key={kind}
              kind={kind}
              attachment={attachmentFor(kind)}
              isOpen={openPickerKind === kind}
              onOpen={() => setOpenPickerKind((current) => (current === kind ? null : kind))}
              onRemove={() => onRemoveAttachment(kind)}
            />
          ))}
        </div>

        {openPickerKind && (
          <MomentAttachPicker
            kind={openPickerKind}
            onSelect={(option) => selectAttachment(openPickerKind, option)}
            onClose={() => setOpenPickerKind(null)}
          />
        )}
      </div>

      {needLine && (
        <p className="-mt-2 flex items-start gap-2 text-[13.5px] leading-relaxed text-ink-muted">
          <IconComponent
            iconName="InformationCircleIcon"
            size={17}
            color="currentColor"
            className="mt-0.5 flex-shrink-0 text-brand"
          />
          {needLine}
        </p>
      )}
    </div>
  );
};
