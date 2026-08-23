'use client';

import { AvatarStack } from '@/app/(experiences)/experiences/components/AvatarStack';
import { PhotoImage } from '@/app/shared/components/Images';
import { useJoinCommunity } from '@/app/shared/hooks/useCommunities';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { BucketListMember } from '@/types/bucket-list';
import { Community, CommunityMember } from '@/types/community';

const AVATAR_LIMIT = 3;

const nameOf = (member: CommunityMember) =>
  member.user?.displayName ||
  `${member.user?.firstName ?? ''} ${member.user?.lastName ?? ''}`.trim() ||
  'Member';

export const JoinCommunityPanel = ({
  community,
  currentUserId,
}: {
  community: Community;
  currentUserId: string;
}) => {
  const { toast } = useToast();
  const { mutate: joinCommunity, isPending } = useJoinCommunity();

  const members: CommunityMember[] = community.members ?? [];
  const memberCount = community.membersCount ?? members.length;

  const isMember = members.some((member) => member.user?.id === currentUserId);
  const owner = members.find((member) => member.role === 'owner');

  const avatarUsers: BucketListMember[] = members.slice(0, AVATAR_LIMIT).map((member) => ({
    id: member.id,
    name: nameOf(member),
    picture: member.user?.picture || null,
  }));

  const handleJoin = () => {
    joinCommunity(community.id, {
      onSuccess: () =>
        toast({
          title: community.isPublic ? 'Joined' : 'Request sent',
          description: community.isPublic
            ? `You are now a member of ${community.title}`
            : 'An administrator will review your request',
          variant: 'success',
        }),
      onError: (error: Error) =>
        toast({ title: 'Could not join', description: error.message, variant: 'destructive' }),
    });
  };

  return (
    <div className="space-y-4 rounded-3xl bg-gray-50 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-gray-900">Join this community</p>
        {/* The API exposes only `is_public`; there is no separate invite-only
            flag, so a private community is labelled as such */}
        {!community.isPublic && (
          <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Private
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-white p-4">
        {avatarUsers.length > 0 && (
          <AvatarStack
            users={avatarUsers}
            max={AVATAR_LIMIT}
            extraCount={Math.max(memberCount - avatarUsers.length, 0)}
          />
        )}
        <div className="min-w-0">
          <p className="font-bold text-gray-900">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </p>
          {/* ⚠️ "N people you follow are in" needs a mutual-follow count. There
              is no follow graph in the API, so the line is omitted. */}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Members get first access to experiences, the moments feed and the group chat.
      </p>

      <Button
        onClick={handleJoin}
        disabled={isPending || isMember}
        className="w-full rounded-full bg-lime font-semibold text-primary hover:bg-lime/90"
      >
        {isMember ? 'Joined' : community.isPublic ? 'Join Community' : 'Request to Join'}
      </Button>

      {owner && (
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4">
          <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
            <PhotoImage
              src={owner.user?.picture}
              alt={nameOf(owner)}
              fill
              sizes="44px"
              className="object-cover"
              fallback={
                <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-600">
                  {nameOf(owner).charAt(0).toUpperCase()}
                </div>
              }
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold text-gray-900">{nameOf(owner)}</p>
            {/* ⚠️ No per-organiser experience count in the API */}
            <p className="text-sm text-gray-500">Organiser</p>
          </div>
        </div>
      )}
    </div>
  );
};
