'use client';

import {
  useAcceptCommunityInvite,
  useDeclineCommunityInvite,
  useJoinCommunity,
  useLeaveCommunity,
} from '@/app/shared/hooks/useCommunities';
import { useToast } from '@/app/shared/hooks/useToast';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { Community } from '@/types/community';

/**
 * Join and Leave, shared by the action bar, the invited state and the Leave
 * button. Both take effect straight away; the drawer refetches the community
 * and its view follows the new membership.
 *
 * Joining goes through `request-to-join`, which accepts a public community at
 * once. An invite is answered through `accept-invite` and `decline-invite`
 * instead: `request-to-join` would turn an invite to a private community into
 * a request its host must approve (DEV-381).
 */
export const useCommunityActions = (community: Community, currentUserId?: string) => {
  const { toast } = useToast();
  const { needAuth } = useAuthDialog();
  const { mutate: joinCommunity, isPending: isJoining } = useJoinCommunity();
  const { mutate: leaveCommunity, isPending: isLeaving } = useLeaveCommunity();
  const { mutate: acceptInvite, isPending: isAccepting } = useAcceptCommunityInvite();
  const { mutate: declineInvite, isPending: isDeclining } = useDeclineCommunityInvite();

  const join = (successMessage: string) =>
    joinCommunity(community.id, {
      onSuccess: () => toast({ description: successMessage, variant: 'success' }),
      onError: (error: Error) =>
        toast({ title: 'Could not join', description: error.message, variant: 'destructive' }),
    });

  // Signed out, sign-up carries on to the join, so the one press is the one that counts
  const withAccount = (then: () => void) => (currentUserId ? then() : needAuth('join', then));

  return {
    isJoining: isJoining || isAccepting,
    isDeclining,
    isLeaving,
    join: () =>
      withAccount(() => join(`You joined ${community.title}. Membership does not book a seat.`)),
    acceptInvite: () =>
      withAccount(() =>
        acceptInvite(community.id, {
          onSuccess: () =>
            toast({
              description: `You joined ${community.title}. Joining does not book or pay for anything.`,
              variant: 'success',
            }),
          onError: (error: Error) =>
            toast({ title: 'Could not join', description: error.message, variant: 'destructive' }),
        }),
      ),
    /** `onDeclined` runs once the server has it, so the drawer closes only then. */
    declineInvite: (onDeclined?: () => void) =>
      declineInvite(community.id, {
        onSuccess: () => {
          onDeclined?.();
          toast({ description: `Invite to ${community.title} declined.` });
        },
        onError: (error: Error) =>
          toast({ title: 'Could not decline', description: error.message, variant: 'destructive' }),
      }),
    /** A private community: a request its hosts answer (DEV-447). */
    requestToJoin: () =>
      withAccount(() =>
        joinCommunity(community.id, {
          onSuccess: () =>
            toast({
              description: `Request sent. ${community.title}'s admins will let you know.`,
              variant: 'success',
            }),
          onError: (error: Error) =>
            toast({
              title: 'Could not send the request',
              description: error.message,
              variant: 'destructive',
            }),
        }),
      ),
    /** Takes back a request still waiting on its hosts - `leave` does both (DEV-447). */
    withdrawRequest: () =>
      leaveCommunity(
        { communityId: community.id },
        {
          onSuccess: () => toast({ description: `Request to join ${community.title} withdrawn.` }),
          onError: (error: Error) =>
            toast({
              title: 'Could not withdraw',
              description: error.message,
              variant: 'destructive',
            }),
        },
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
