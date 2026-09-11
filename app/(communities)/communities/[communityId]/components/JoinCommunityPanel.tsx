'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  AvatarStack,
  type AvatarStackUser,
} from '@/app/(experiences)/experiences/components/AvatarStack';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
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
import { Community, CommunityMember } from '@/types/community';

const AVATAR_LIMIT = 3;

type Membership = 'none' | 'pending' | 'member';

const nameOf = (member: CommunityMember) =>
  member.user?.displayName ||
  `${member.user?.firstName ?? ''} ${member.user?.lastName ?? ''}`.trim() ||
  'Member';

/**
 * A join request on a public community is accepted immediately; on a private
 * one it is only recorded as `requested` until a host approves it. The three
 * states are kept apart so the button never offers to leave a community the
 * reader has not actually been let into yet.
 *
 * A record whose status the API leaves out counts as a member — membership is
 * what having the record means, and the alternative would strand the reader on
 * a pending state they cannot act on.
 */
const membershipOf = (member?: CommunityMember): Membership => {
  if (!member) return 'none';
  if (member.inviteStatus === 'requested' || member.inviteStatus === 'pending') return 'pending';
  if (member.inviteStatus === 'rejected' || member.inviteStatus === 'ignored') return 'none';
  return 'member';
};

export const JoinCommunityPanel = ({
  community,
  currentUserId,
}: {
  community: Community;
  currentUserId: string;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { mutate: joinCommunity, isPending: isJoining } = useJoinCommunity();
  const { mutate: leaveCommunity, isPending: isLeaving } = useLeaveCommunity();

  const members: CommunityMember[] = community.members ?? [];
  const memberCount = community.membersCount ?? members.length;

  const currentMember = members.find((member) => member.user?.id === currentUserId);
  // The page is server-rendered, so the membership record only changes after
  // the refresh lands. Until then the mutation result stands in for it.
  const [pendingMembership, setPendingMembership] = useState<Membership | null>(null);
  const membership = pendingMembership ?? membershipOf(currentMember);

  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  const owner = members.find((member) => member.role === 'owner');

  const avatarUsers: AvatarStackUser[] = members.slice(0, AVATAR_LIMIT).map((member) => ({
    id: member.id,
    name: nameOf(member),
    picture: member.user?.picture || null,
  }));

  const handleJoin = () => {
    joinCommunity(community.id, {
      onSuccess: () => {
        setPendingMembership(community.isPublic ? 'member' : 'pending');
        router.refresh();
        toast({
          title: community.isPublic ? 'Joined' : 'Request sent',
          description: community.isPublic
            ? `You are now a member of ${community.title}`
            : 'An administrator will review your request',
          variant: 'success',
        });
      },
      onError: (error: Error) =>
        toast({ title: 'Could not join', description: error.message, variant: 'destructive' }),
    });
  };

  const handleLeave = () => {
    leaveCommunity(
      { communityId: community.id, userId: currentUserId },
      {
        onSuccess: () => {
          setPendingMembership('none');
          setIsLeaveConfirmOpen(false);
          router.refresh();
          toast({
            title: 'Left community',
            description: `You are no longer a member of ${community.title}`,
            variant: 'success',
          });
        },
        onError: (error: Error) =>
          toast({ title: 'Could not leave', description: error.message, variant: 'destructive' }),
      },
    );
  };

  return (
    <div className="space-y-4 rounded-3xl bg-gray-50 p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-gray-900">
          {membership === 'member' ? 'Your membership' : 'Join this community'}
        </p>
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
        {membership === 'member'
          ? 'You have first access to experiences, the moments feed and the group chat.'
          : membership === 'pending'
            ? 'An administrator is reviewing your request. You will be notified once it is approved.'
            : 'Members get first access to experiences, the moments feed and the group chat.'}
      </p>

      {membership === 'member' ? (
        <Button
          variant="destructive"
          onClick={() => setIsLeaveConfirmOpen(true)}
          disabled={isLeaving}
          className="w-full rounded-full font-semibold"
        >
          <span className="flex items-center gap-2">
            <IconComponent iconName="Logout03Icon" color="currentColor" size={16} />
            Leave community
          </span>
        </Button>
      ) : (
        <Button
          onClick={handleJoin}
          disabled={isJoining || membership === 'pending'}
          className="w-full rounded-full bg-lime font-semibold text-primary hover:bg-lime/90"
        >
          {membership === 'pending'
            ? 'Request pending'
            : community.isPublic
              ? 'Join Community'
              : 'Request to Join'}
        </Button>
      )}

      <AlertDialog open={isLeaveConfirmOpen} onOpenChange={setIsLeaveConfirmOpen}>
        <AlertDialogContent className="max-w-md gap-5 rounded-2xl p-6">
          <AlertDialogHeader className="space-y-4 text-left sm:text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <IconComponent
                iconName="Alert02Icon"
                size={20}
                color="currentColor"
                className="text-red-500"
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
            {/* Not AlertDialogAction: that closes the dialog on click, which
                would hide the spinner while the request is still in flight */}
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
