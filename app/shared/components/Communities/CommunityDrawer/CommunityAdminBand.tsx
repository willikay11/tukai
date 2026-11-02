'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { SendMessage } from '@/app/shared/components/SendMessage';
import { useToast } from '@/app/shared/hooks/useToast';
import { CommunityMember } from '@/types/community';

import { nameOfMember } from './community-drawer';

/**
 * The handoff's Admin band: the community's owner, with a way to message
 * them. When the signed-in reader IS the owner there is nobody singular to
 * message about their own community - the API has no bulk-message endpoint,
 * so "Message members" toasts instead of opening anything (see the drawer
 * fork's backend-gap report).
 */
export const CommunityAdminBand = ({
  owner,
  isOwnerSelf,
}: {
  owner?: CommunityMember;
  isOwnerSelf: boolean;
}) => {
  const { toast } = useToast();
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  if (!owner) return null;

  const name = isOwnerSelf ? 'You' : nameOfMember(owner);

  return (
    <div className="-mx-6 flex flex-wrap items-center gap-3.5 bg-surface px-6 py-4">
      <span className="relative h-[52px] w-[52px] flex-shrink-0 overflow-hidden rounded-full bg-surface-brand">
        <PhotoImage
          src={owner.user?.picture}
          alt=""
          fill
          sizes="52px"
          className="object-cover"
          fallback={
            <div className="flex h-full w-full items-center justify-center text-base font-bold text-brand-ink">
              {name.charAt(0).toUpperCase()}
            </div>
          }
        />
      </span>

      <div className="min-w-0 flex-1 basis-[220px]">
        <button
          type="button"
          onClick={() => toast({ description: `Opening ${name}'s profile` })}
          className="inline-flex max-w-full items-center gap-1.5 text-[15px] text-gray-900 transition-colors hover:text-brand"
        >
          <span className="text-ink-muted">Admin:</span>
          <span className="truncate font-semibold">{name}</span>
          <span role="img" aria-label="Verified" className="flex-shrink-0">
            <IconComponent
              iconName="CheckmarkBadge01Icon"
              variant="bulk"
              size={18}
              color="currentColor"
              className="text-brand"
            />
          </span>
          <IconComponent
            iconName="ArrowUpRight01Icon"
            size={16}
            color="currentColor"
            className="flex-shrink-0 text-brand"
          />
        </button>
      </div>

      <button
        type="button"
        onClick={() =>
          isOwnerSelf
            ? toast({ description: "Message members isn't available yet" })
            : setIsMessageOpen(true)
        }
        className="inline-flex h-12 flex-shrink-0 items-center gap-2 rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-5 text-[14.5px] font-bold text-white transition-[filter] hover:brightness-105 active:scale-[0.98]"
      >
        <IconComponent iconName="BubbleChatIcon" size={18} color="currentColor" />
        {isOwnerSelf ? 'Message members' : 'Message host'}
      </button>

      {!isOwnerSelf && owner.user?.id && (
        <SendMessage open={isMessageOpen} setOpen={setIsMessageOpen} recipientId={owner.user.id} />
      )}
    </div>
  );
};
