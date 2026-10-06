'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useCommunityDetail, useJoinCommunity } from '@/app/shared/hooks/useCommunities';
import { useToast } from '@/app/shared/hooks/useToast';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { CommunityMember } from '@/types/community';
import { communityPath } from '@/utils/detail-paths';

const nameOf = (member: CommunityMember) =>
  member.user?.displayName ||
  `${member.user?.firstName ?? ''} ${member.user?.lastName ?? ''}`.trim() ||
  'Member';

/**
 * Whether the reader may press Join. A pending request on a private community
 * counts as already in: pressing again would only send a second request.
 */
const canJoin = (member: CommunityMember | undefined): boolean => {
  if (!member) return true;
  return member.inviteStatus === 'rejected' || member.inviteStatus === 'ignored';
};

/**
 * The community that holds this place, with Join where the reader can take it.
 *
 * Lists the owning community only: the ownership record names one, and the
 * drawer has no way to find others that hold the place. Renders nothing for an
 * unclaimed place, or until the community has loaded.
 */
export const PlaceCommunity = ({ communityId }: { communityId: string }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { toast } = useToast();
  const { openSignInWithCallback } = useAuthDialog();

  const { data: response } = useCommunityDetail(communityId, Boolean(communityId));
  const { mutate: joinCommunity, isPending: isJoining } = useJoinCommunity();

  const community = response?.data;
  if (!community) return null;

  const members: CommunityMember[] = community.members ?? [];
  const memberCount = community.membersCount ?? members.length;
  const currentMember = userId ? members.find((member) => member.user?.id === userId) : undefined;
  const owner = members.find((member) => member.role === 'owner');

  const join = () => {
    joinCommunity(community.id, {
      onSuccess: () =>
        toast({
          title: community.isPublic ? 'Joined' : 'Request sent',
          description: community.isPublic
            ? `You are now a member of ${community.title}. Membership does not reserve a seat.`
            : 'An administrator will review your request',
          variant: 'success',
        }),
      onError: (error: Error) =>
        toast({ title: 'Could not join', description: error.message, variant: 'destructive' }),
    });
  };

  // Signing in carries on to the join, so the one press is the one that counts
  const handleJoin = () => (userId ? join() : openSignInWithCallback(join));

  return (
    <section className="space-y-3.5 py-6">
      <h3 className="text-[19px] font-bold tracking-[-0.2px] text-brand-ink">Community</h3>

      <div className="flex items-center gap-4">
        <Link href={communityPath(community)} className="flex min-w-0 flex-1 items-center gap-4">
          <PhotoImage
            src={community.photos?.[0]?.photo}
            alt=""
            width={72}
            height={72}
            sizes="72px"
            className="h-[72px] w-[72px] flex-shrink-0 rounded-[14px] bg-surface-brand object-cover"
          />
          <span className="flex min-w-0 flex-col gap-1.5">
            <span className="flex min-w-0 items-center gap-2 text-[15.5px] font-medium text-brand-ink">
              <span className="truncate">{community.title}</span>
              <IconComponent
                iconName="ArrowUpRight01Icon"
                size={17}
                color="currentColor"
                className="flex-shrink-0 text-brand"
              />
            </span>
            <span className="text-sm text-ink-muted">
              {owner ? `Hosted by ${nameOf(owner)}` : `${memberCount} members`}
            </span>
          </span>
        </Link>

        {canJoin(currentMember) && (
          <button
            type="button"
            onClick={handleJoin}
            disabled={isJoining}
            className="inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-full bg-lime pl-4 pr-5 text-[15px] font-medium text-brand-ink shadow-md transition-colors hover:bg-lime-dark disabled:opacity-60"
          >
            <IconComponent iconName="UserAdd01Icon" size={19} color="currentColor" />
            Join
          </button>
        )}
      </div>
    </section>
  );
};
