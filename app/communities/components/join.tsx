'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useJoinCommunity, useJoinCommunityViaInvite } from '@/hooks/communities';
import { toast } from '@/hooks/use-toast';
import { CommunityMember } from '@/types/community';

export default function Join({
  communityId,
  members,
  currentUserId,
  token
}: {
  communityId: string;
  members: CommunityMember[];
  currentUserId: string;
  token?: string;
}) {
  const {
    mutate: joinCommunityMutation,
    isPending,
    isSuccess,
    isError,
    data,
    error,
  } = useJoinCommunity();

  const { mutate: joinCommunityViaInviteMutation, isPending: isInvitePending, isSuccess: isInviteSuccess, isError: isInviteError, data: inviteData, error: inviteError } = useJoinCommunityViaInvite();

  const member = members.find((member) => member?.user?.id === currentUserId);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Request Sent',
        description: 'We have received your request to join the community.',
        variant: 'success',
      });
    }

    if (isInviteSuccess) {
      toast({
        title: 'Successfully Joined Community',
        description: 'You have successfully joined the community via invite.',
        variant: 'success',
      });
    }

    if (isError || isInviteError) {
      toast({
        title: 'Unable to join community',
        description: (error as any)?.message || (inviteError as any)?.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  }, [isSuccess, isInviteSuccess, isError, isInviteError, data, inviteData, error, inviteError]);


  useEffect(() => {
    if (token) {
      joinCommunityViaInviteMutation({ communityId, token });
    }
  }, [token])

  if (member && member.inviteStatus === 'accepted') {
    return null;
  }

  return (
    <Button
      onClick={() => joinCommunityMutation(communityId)}
      disabled={isPending || isInvitePending || (member && member.inviteStatus === 'requested')}
      className="mr-2.5"
    >
      {member?.inviteStatus === 'requested' ? 'Pending Approval' : isPending || isInvitePending ? 'Joining...' : 'Join Community'}
    </Button>
  );
}
