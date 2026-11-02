'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { SendMessage } from '@/app/shared/components/SendMessage';
import { useJoinCommunity, useLeaveCommunity } from '@/app/shared/hooks/useCommunities';
import { useToast } from '@/app/shared/hooks/useToast';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { Community, CommunityMember } from '@/types/community';

import { CommunityMembership, membershipOf } from './community-drawer';

/**
 * The handoff's action bar: a gradient primary action and a lime "Share
 * moment" always beside it, plus Leave for a member who does not own the
 * community.
 *
 * Joining calls the same `request-to-join` endpoint as before - the API
 * appears to accept a public community's join immediately and holds a
 * private one as `pending` until an admin approves it. True "instant join
 * always", which the handoff and CONVENTIONS.md both describe, is not fully
 * achievable for private communities without a backend change; this stays
 * honest about the outcome rather than claiming it joined when it did not
 * (see the drawer fork's backend-gap report).
 */
export const CommunityDrawerFooter = ({
  community,
  currentUserId,
  owner,
  isOwnerSelf,
  onShareMoment,
  onBlockedShareMoment,
}: {
  community: Community;
  currentUserId?: string;
  owner?: CommunityMember;
  isOwnerSelf: boolean;
  /** Opens the drawer's own "moment" view. */
  onShareMoment: () => void;
  /** Not a member yet - toasts the same "join to share" message the Moments block uses. */
  onBlockedShareMoment: () => void;
}) => {
  const { toast } = useToast();
  const { needAuth } = useAuthDialog();
  const { mutate: joinCommunity, isPending: isJoining } = useJoinCommunity();
  const { mutate: leaveCommunity, isPending: isLeaving } = useLeaveCommunity();
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  const currentMember = (community.members ?? []).find(
    (member: CommunityMember) => member.user?.id === currentUserId,
  );
  const [pendingMembership, setPendingMembership] = useState<CommunityMembership | null>(null);
  const membership = pendingMembership ?? membershipOf(currentMember);
  const isMember = membership === 'member';

  const join = () => {
    joinCommunity(community.id, {
      onSuccess: () => {
        setPendingMembership(community.isPublic ? 'member' : 'pending');
        toast({
          title: community.isPublic ? 'Joined' : 'Request sent',
          description: community.isPublic
            ? `You are now a member of ${community.title}. Membership does not reserve a seat.`
            : 'An administrator will review your request',
          variant: 'success',
        });
      },
      onError: (error: Error) =>
        toast({ title: 'Could not join', description: error.message, variant: 'destructive' }),
    });
  };

  const handleJoin = () => (currentUserId ? join() : needAuth('join', join));

  const handleLeave = () => {
    leaveCommunity(
      { communityId: community.id, userId: currentUserId ?? '' },
      {
        onSuccess: () => {
          setPendingMembership('none');
          toast({
            title: 'Left community',
            description: `You are no longer a member of ${community.title}. Anything you booked is still yours.`,
            variant: 'success',
          });
        },
        onError: (error: Error) =>
          toast({ title: 'Could not leave', description: error.message, variant: 'destructive' }),
      },
    );
  };

  return (
    <>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
        {isMember ? (
          <button
            type="button"
            onClick={() =>
              isOwnerSelf
                ? toast({ description: "Message members isn't available yet" })
                : setIsMessageOpen(true)
            }
            className="inline-flex h-12 flex-shrink-0 items-center gap-2 rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-6 text-[15px] font-semibold text-white transition-[filter] hover:brightness-105 active:scale-[0.98]"
          >
            <IconComponent iconName="BubbleChatIcon" size={20} color="currentColor" />
            {isOwnerSelf ? 'Message members' : 'Message host'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleJoin}
            disabled={isJoining || membership === 'pending'}
            className="inline-flex h-12 flex-shrink-0 items-center gap-2 rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-6 text-[15px] font-semibold text-white transition-[filter] hover:brightness-105 active:scale-[0.98] disabled:opacity-60"
          >
            {membership === 'pending' ? 'Request pending' : 'Join community'}
          </button>
        )}

        <button
          type="button"
          onClick={isMember ? onShareMoment : onBlockedShareMoment}
          className="inline-flex h-12 flex-shrink-0 items-center gap-2 rounded-full bg-lime px-6 text-[15px] font-semibold text-brand-ink transition-colors hover:bg-lime-dark active:scale-[0.98]"
        >
          <IconComponent
            iconName="DashboardCircleAddIcon"
            variant="duotone"
            size={20}
            color="currentColor"
          />
          Share moment
        </button>

        {isMember && !isOwnerSelf && (
          <button
            type="button"
            onClick={handleLeave}
            disabled={isLeaving}
            className="flex h-12 flex-shrink-0 items-center gap-2 rounded-full px-3 text-[15px] font-medium text-danger transition-colors hover:bg-danger-surface disabled:opacity-60"
          >
            <IconComponent iconName="Logout03Icon" color="currentColor" size={20} />
            Leave community
          </button>
        )}
      </div>

      {owner?.user?.id && (
        <SendMessage open={isMessageOpen} setOpen={setIsMessageOpen} recipientId={owner.user.id} />
      )}
    </>
  );
};
