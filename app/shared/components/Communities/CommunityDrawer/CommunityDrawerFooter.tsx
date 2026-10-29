'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useJoinCommunity, useLeaveCommunity } from '@/app/shared/hooks/useCommunities';
import { useToast } from '@/app/shared/hooks/useToast';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { Community, CommunityMember } from '@/types/community';

import { CommunityMembership, membershipOf } from './community-drawer';

/**
 * Join, pending, or Leave - the three states the full page's own
 * JoinCommunityPanel shows, condensed to one footer button. The member
 * roster and counts it also carries live in the drawer's own Members
 * section, so this is just the action.
 */
export const CommunityDrawerFooter = ({
  community,
  currentUserId,
}: {
  community: Community;
  currentUserId?: string;
}) => {
  const { toast } = useToast();
  const { needAuth } = useAuthDialog();
  const { mutate: joinCommunity, isPending: isJoining } = useJoinCommunity();
  const { mutate: leaveCommunity, isPending: isLeaving } = useLeaveCommunity();

  const currentMember = (community.members ?? []).find(
    (member: CommunityMember) => member.user?.id === currentUserId,
  );
  const [pendingMembership, setPendingMembership] = useState<CommunityMembership | null>(null);
  const membership = pendingMembership ?? membershipOf(currentMember);

  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

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
          setIsLeaveConfirmOpen(false);
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
      {membership === 'member' ? (
        <button
          type="button"
          onClick={() => setIsLeaveConfirmOpen(true)}
          disabled={isLeaving}
          className="flex h-12 items-center gap-2 px-1.5 text-[15px] font-medium text-danger hover:underline disabled:opacity-60"
        >
          <IconComponent iconName="Logout03Icon" color="currentColor" size={20} />
          Leave community
        </button>
      ) : (
        <Button
          onClick={handleJoin}
          disabled={isJoining || membership === 'pending'}
          isLoading={isJoining}
          variant="lime"
          className="h-12 rounded-full px-6 text-[15px]"
        >
          {membership === 'pending'
            ? 'Request pending'
            : community.isPublic
              ? 'Join community'
              : 'Request to join'}
        </Button>
      )}

      <AlertDialog open={isLeaveConfirmOpen} onOpenChange={setIsLeaveConfirmOpen}>
        <AlertDialogContent className="max-w-md gap-5 rounded-2xl p-6">
          <AlertDialogHeader className="space-y-4 text-left sm:text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-surface">
              <IconComponent
                iconName="Alert02Icon"
                size={20}
                color="currentColor"
                className="text-danger"
              />
            </span>

            <div className="space-y-2">
              <AlertDialogTitle className="text-lg font-bold text-gray-900">
                Leave {community.title}?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-gray-500">
                You will lose access to the group chat, the moments feed and member-only
                experiences.
                {!community.isPublic && ' Rejoining needs an administrator to approve you again.'}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 sm:gap-3">
            <AlertDialogCancel className="border-0 bg-transparent font-medium text-gray-600 shadow-none hover:bg-transparent hover:text-gray-900">
              Stay a member
            </AlertDialogCancel>
            <Button
              variant="destructive"
              isLoading={isLeaving}
              onClick={handleLeave}
              className="rounded-lg px-5"
            >
              Leave community
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
