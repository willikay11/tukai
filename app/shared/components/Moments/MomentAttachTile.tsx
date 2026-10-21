'use client';

import { IconComponent } from '@/app/shared/components/Icons';

import type { AttachmentKind, MomentAttachment } from './useMomentComposer';

const KIND_META: Record<AttachmentKind, { icon: string; badge: string }> = {
  experience: { icon: 'Ticket01Icon', badge: 'Experience' },
  community: { icon: 'UserMultipleIcon', badge: 'Community' },
  place: { icon: 'Location01Icon', badge: 'Place' },
};

/**
 * One of up to three tiles under "Where this moment took place" - fixed by
 * whichever page opened the composer, with no picker to add another. Removing
 * one is one-way; there is nothing to search for, so the only way back is to
 * close and reopen the drawer.
 */
export const MomentAttachTile = ({
  attachment,
  onRemove,
}: {
  attachment: MomentAttachment;
  onRemove: () => void;
}) => {
  const meta = KIND_META[attachment.kind];

  return (
    <div className="relative">
      <div className="relative flex aspect-square flex-col justify-end overflow-hidden rounded-xl bg-surface p-3">
        <span
          className="absolute inset-0 bg-gradient-to-t from-brand-ink/90 via-brand-ink/10 to-transparent"
          aria-hidden="true"
        />
        <IconComponent
          iconName={meta.icon}
          size={22}
          color="currentColor"
          className="absolute left-3 top-3 z-[1] text-white"
        />
        <span className="relative z-[1] inline-flex h-[22px] w-fit items-center rounded-full bg-lime px-2 text-[11.5px] font-bold text-brand-ink">
          {meta.badge}
        </span>
        <span className="relative z-[1] mt-1 line-clamp-2 text-sm font-bold leading-[1.25] text-white">
          {attachment.label}
        </span>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${attachment.label}`}
        className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center border-none bg-transparent"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(1,51,52,.72)] text-white">
          <IconComponent iconName="Cancel01Icon" size={16} color="currentColor" />
        </span>
      </button>
    </div>
  );
};
