'use client';

import { IconComponent } from '@/app/shared/components/Icons';

import type { AttachmentKind, MomentAttachment } from './useMomentComposer';

const KIND_META: Record<AttachmentKind, { icon: string; badge: string; selectLabel: string }> = {
  experience: { icon: 'Ticket01Icon', badge: 'Experience', selectLabel: 'Select experience' },
  community: { icon: 'UserMultipleIcon', badge: 'Community', selectLabel: 'Select community' },
  place: { icon: 'Location01Icon', badge: 'Place', selectLabel: 'Select place' },
};

/**
 * One of the three tiles under "Where did this moment take place?" - empty
 * and clickable (opens that kind's picker) until something is attached, then
 * filled with a remove button. Whichever page opened the composer may have
 * filled one or more already; the reader can still change or clear any of
 * them.
 */
export const MomentAttachTile = ({
  kind,
  attachment,
  isOpen,
  onOpen,
  onRemove,
}: {
  kind: AttachmentKind;
  attachment: MomentAttachment | null;
  isOpen: boolean;
  onOpen: () => void;
  onRemove: () => void;
}) => {
  const meta = KIND_META[kind];

  if (!attachment) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-expanded={isOpen}
        aria-label={meta.selectLabel}
        className={`relative flex aspect-square flex-col justify-between rounded-xl bg-surface p-3 text-left transition-colors hover:bg-surface-brand ${
          isOpen ? 'ring-2 ring-brand ring-offset-2 ring-offset-white' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <IconComponent iconName={meta.icon} size={28} color="currentColor" className="text-brand" />
          <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-lime text-brand-ink">
            <IconComponent iconName="Add01Icon" size={18} color="currentColor" />
          </span>
        </div>

        <span className="text-[15px] font-bold leading-tight text-gray-900">{meta.selectLabel}</span>
      </button>
    );
  }

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
