'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { SendMessage } from '@/app/shared/components/SendMessage';
import { useToast } from '@/app/shared/hooks/useToast';
import { CommunityMember } from '@/types/community';

import { MESSAGE_MEMBERS_UNAVAILABLE } from './CommunityAdminBand';

const BUTTON =
  'inline-flex h-12 flex-none items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 text-[15px] font-semibold transition-[transform,box-shadow,filter,background-color] duration-200 active:scale-[0.97] disabled:opacity-60';

/**
 * The action bar: Join community for anyone not in yet, Message host for
 * members and Message members for the owner - then Share moment, which does
 * what the composer row does. Leave lives in the body, not here.
 */
export const CommunityDrawerFooter = ({
  isMember,
  isOwnerSelf,
  owner,
  isJoining,
  onJoin,
  onShareMoment,
}: {
  isMember: boolean;
  isOwnerSelf: boolean;
  owner?: CommunityMember;
  isJoining: boolean;
  onJoin: () => void;
  onShareMoment: () => void;
}) => {
  const { toast } = useToast();
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  return (
    <>
      {isOwnerSelf || isMember ? (
        <button
          type="button"
          onClick={() =>
            isOwnerSelf
              ? toast({ description: MESSAGE_MEMBERS_UNAVAILABLE })
              : setIsMessageOpen(true)
          }
          className={`${BUTTON} bg-gradient-to-b from-brand-mid to-brand-deep text-white hover:shadow-[0_6px_16px_rgba(1,51,52,.16)] hover:brightness-[1.04]`}
        >
          <IconComponent iconName="BubbleChatIcon" size={20} color="currentColor" />
          {isOwnerSelf ? 'Message members' : 'Message host'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onJoin}
          disabled={isJoining}
          className={`${BUTTON} bg-gradient-to-b from-brand-mid to-brand-deep text-white hover:shadow-[0_6px_16px_rgba(1,51,52,.16)] hover:brightness-[1.04]`}
        >
          <IconComponent iconName="UserAdd02Icon" size={20} color="currentColor" />
          Join community
        </button>
      )}

      <button
        type="button"
        onClick={onShareMoment}
        className={`${BUTTON} bg-lime text-brand-ink hover:bg-lime-dark hover:shadow-[0_6px_16px_rgba(176,232,0,.4)]`}
      >
        <IconComponent
          iconName="DashboardCircleAddIcon"
          variant="duotone"
          size={20}
          color="currentColor"
        />
        Share moment
      </button>

      {isMember && !isOwnerSelf && owner?.user?.id && (
        <SendMessage open={isMessageOpen} setOpen={setIsMessageOpen} recipientId={owner.user.id} />
      )}
    </>
  );
};
