'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useJoinCommunity } from '@/hooks/communities';
import { toast } from '@/hooks/use-toast';
import { CommunityMember } from '@/types/community';

export default function Join({
  communityId,
  members,
  currentUserId,
}: {
  communityId: string;
  members: CommunityMember[];
  currentUserId: string;
}) {
  const {
    mutate: joinCommunityMutation,
    isPending,
    isSuccess,
    isError,
    data,
    error,
  } = useJoinCommunity();

  const member = members.find((member) => member.user.id === currentUserId);

  console.log('Member:', member);

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: 'Request Sent',
        description: 'We have received your request to join the community.',
        variant: 'success',
      });
    }
    if (isError) {
      toast({
        title: 'Unable to join community',
        description: (error as any)?.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  }, [isSuccess, isError, data, error]);

  if (member && member.inviteStatus === 'accepted') {
    return null;
  }

  return (
    <Button
      onClick={() => joinCommunityMutation(communityId)}
      disabled={isPending || (member && member.inviteStatus === 'requested')}
      className="mr-2.5"
    >
      {member?.inviteStatus === 'requested' ? 'Pending Approval' : isPending ? 'Joining...' : 'Join Community'}
    </Button>
  );
}
