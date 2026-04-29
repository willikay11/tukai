'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useJoinCommunity, useJoinCommunityViaInvite } from '@/app/shared/hooks/useCommunities';
import { toast } from '@/app/shared/hooks/useToast';
import { CommunityMember } from '@/types/community';

export const Join = ({
  communityId,
  members,
  currentUserId,
  token,
}: {
  communityId: string;
  members: CommunityMember[];
  currentUserId: string;
  token?: string;
}) => {
  const router = useRouter();
  const [isRequested, setIsRequested] = useState(false);
  const {
    mutate: joinCommunityMutation,
    isPending,
    isSuccess,
    isError,
    data,
    error,
  } = useJoinCommunity();

  const {
    mutate: joinCommunityViaInviteMutation,
    isPending: isInvitePending,
    isSuccess: isInviteSuccess,
    isError: isInviteError,
    data: inviteData,
    error: inviteError,
  } = useJoinCommunityViaInvite();

  const member = members.find((member) => member?.user?.id === currentUserId);

  useEffect(() => {
    if (member?.inviteStatus === 'requested') {
      setIsRequested(true);
    }
  }, [member]);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Request Sent',
        description: 'We have received your request to join the community.',
        variant: 'success',
      });
      setIsRequested(true);
      // router.refresh();
    }

    if (isInviteSuccess) {
      toast({
        title: 'Successfully Joined Community',
        description: 'You have successfully joined the community via invite.',
        variant: 'success',
      });
      router.refresh();
    }

    if (isError || isInviteError) {
      toast({
        title: 'Unable to join community',
        description:
          (error as any)?.message || (inviteError as any)?.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  }, [isSuccess, isInviteSuccess, isError, isInviteError, data, inviteData, error, inviteError]);

  useEffect(() => {
    if (token) {
      joinCommunityViaInviteMutation({ communityId, token });
    }
  }, [token]);

  if (member && member.inviteStatus === 'accepted') {
    return null;
  }

  return (
    <Button
      onClick={() => joinCommunityMutation(communityId)}
      disabled={isPending || isInvitePending || isRequested}
      className="mr-2.5"
    >
      {isRequested
        ? 'Pending Approval'
        : isPending || isInvitePending
          ? 'Joining...'
          : 'Join Community'}
    </Button>
  );
};
