'use client';

import { useJoinCommunity, useLeaveCommunity } from '@/app/shared/hooks/useCommunities';
import { useToast } from '@/app/shared/hooks/useToast';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { Community } from '@/types/community';

/**
 * Join and Leave, shared by the action bar, the invited state and the Leave
 * button. Both take effect straight away; the drawer refetches the community
 * and its view follows the new membership.
 *
 * Joining goes through `request-to-join`, which accepts a public community at
 * once and, per the swagger, turns a pending invite into a membership.
 */
export const useCommunityActions = (community: Community, currentUserId?: string) => {
  const { toast } = useToast();
  const { needAuth } = useAuthDialog();
  const { mutate: joinCommunity, isPending: isJoining } = useJoinCommunity();
  const { mutate: leaveCommunity, isPending: isLeaving } = useLeaveCommunity();

  const join = (successMessage: string) =>
    joinCommunity(community.id, {
      onSuccess: () => toast({ description: successMessage, variant: 'success' }),
      onError: (error: Error) =>
        toast({ title: 'Could not join', description: error.message, variant: 'destructive' }),
    });

  // Signed out, sign-up carries on to the join, so the one press is the one that counts
  const withAccount = (then: () => void) => (currentUserId ? then() : needAuth('join', then));

  return {
    isJoining,
    isLeaving,
    join: () =>
      withAccount(() => join(`You joined ${community.title}. Membership does not book a seat.`)),
    acceptInvite: () =>
      withAccount(() =>
        join(`You joined ${community.title}. Joining does not book or pay for anything.`),
      ),
    leave: () =>
      leaveCommunity(
        { communityId: community.id },
        {
          onSuccess: () =>
            toast({
              description: `You left ${community.title}. Anything you booked stays on your profile.`,
            }),
          onError: (error: Error) =>
            toast({ title: 'Could not leave', description: error.message, variant: 'destructive' }),
        },
      ),
  };
};
