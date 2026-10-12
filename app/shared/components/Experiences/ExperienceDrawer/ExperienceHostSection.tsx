'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { CheckmarkBadge02Icon } from '@hugeicons/react-pro';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { SendMessage } from '@/app/shared/components/SendMessage/SendMessage';
import { useCommunityDetail, useJoinCommunity } from '@/app/shared/hooks/useCommunities';
import { useToast } from '@/app/shared/hooks/useToast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { CommunityMember } from '@/types/community';
import { Experience } from '@/types/experience';
import { photoUrl } from '@/types/photo';
import { communityPath } from '@/utils/detail-paths';

import { EXPERIENCE_SECTIONS } from './tabs';

/**
 * Whether the reader may press Join. A pending request on a private
 * community counts as already in: pressing again would only send a second
 * request. Same rule `PlaceCommunity` uses.
 */
const canJoin = (member: CommunityMember | undefined): boolean => {
  if (!member) return true;
  return member.inviteStatus === 'rejected' || member.inviteStatus === 'ignored';
};

/**
 * Host, and host community (ED-08).
 *
 * The host row ports `ExperienceOrganiser`'s pattern - the drawer's own copy
 * rather than a shared one, since the page version is sized for a full column
 * rather than the drawer's narrower body.
 *
 * Join reuses `PlaceCommunity`'s pattern: `useJoinCommunity`, the `canJoin`
 * invite-status rule, the sign-in gate and the success toast - fetched via
 * `useCommunityDetail` since `Experience.hostCommunity` itself carries only
 * id/title/photos, no membership.
 *
 * "Going" (ED-08's guest-avatar row) is still not built. `Experience.guests`
 * carries only email and invite status, no picture. The other candidate,
 * `/v1/experiences/purchases/` (`fetchTicketPurchases`), does not fill that
 * gap either: it scopes to purchases the caller can see - their own, or
 * every purchase when they are the experience's host - not a roster any
 * guest can see of who else is going. There is no endpoint today that
 * returns other attendees' names or pictures to a reader who is neither.
 */
export const ExperienceHostSection = ({ experience }: { experience: Experience }) => {
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { toast } = useToast();
  const { openSignInWithCallback } = useAuthDialog();

  const host = experience.host;
  const isOwnExperience = Boolean(session?.user?.id && host?.id && session.user.id === host.id);

  const hostedCount = host?.experienceHostedCount ?? 0;
  const hostedLabel = `${hostedCount} ${hostedCount === 1 ? 'Experience' : 'Experiences'} organised`;

  const communityPhoto = experience.hostCommunity?.photos?.[0]
    ? photoUrl(experience.hostCommunity.photos[0], 'thumb')
    : undefined;

  const hostCommunityId = experience.hostCommunity?.id ?? '';
  const { data: communityResponse } = useCommunityDetail(hostCommunityId, Boolean(hostCommunityId));
  const { mutate: joinCommunity, isPending: isJoining } = useJoinCommunity();
  const community = communityResponse?.data;

  const members: CommunityMember[] = community?.members ?? [];
  const currentMember = userId ? members.find((member) => member.user?.id === userId) : undefined;
  const canJoinCommunity = Boolean(community) && canJoin(currentMember);

  const join = () => {
    if (!community) return;
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

  if (!host && !experience.hostCommunity) return null;

  return (
    <div id={EXPERIENCE_SECTIONS.host} className="scroll-mt-[156px] space-y-4 border-t border-line pt-6">
      {host && (
        <>
          {!isOwnExperience && (
            <SendMessage open={isMessageOpen} setOpen={setIsMessageOpen} recipientId={host.id} />
          )}

          <div className="-mx-6 flex flex-col gap-3 bg-surface px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center">
              <Avatar className="mr-2.5 h-11 w-11 flex-shrink-0">
                <AvatarImage src={host.picture} />
                <AvatarFallback />
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <div className="flex min-w-0 items-center gap-1">
                  <p className="truncate text-[15px] font-semibold text-brand-ink">
                    {host.displayName || `${host.firstName ?? ''} ${host.lastName ?? ''}`.trim()}
                  </p>
                  <CheckmarkBadge02Icon size={16} variant="solid" className="flex-shrink-0 text-brand" />
                </div>
                <p className="text-[14px] text-ink-muted">{hostedLabel}</p>
              </div>
            </div>

            {!isOwnExperience && (
              <button
                type="button"
                onClick={() => setIsMessageOpen(true)}
                className="inline-flex h-10 flex-shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-5 text-[14px] font-bold text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                <IconComponent iconName="MessageMultiple02Icon" size={18} color="currentColor" />
                Message host
              </button>
            )}
          </div>
        </>
      )}

      {experience.hostCommunity && (
        <div className="space-y-4">
          <h3 className="text-[22px] font-bold text-brand-ink">Host community</h3>

          <div className="flex items-center gap-3">
            {communityPhoto && (
              <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl">
                <PhotoImage
                  src={communityPhoto}
                  alt={experience.hostCommunity.title}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={communityPath(experience.hostCommunity)}
                  target="_blank"
                  className="flex min-w-0 items-center gap-1 transition-colors hover:text-brand-ink"
                >
                  <p className="truncate text-[15px] font-semibold text-brand-ink">
                    {experience.hostCommunity.title}
                  </p>
                  <IconComponent
                    iconName="ArrowUpRight01Icon"
                    size={16}
                    color="currentColor"
                    className="flex-shrink-0 text-brand"
                  />
                </Link>

                {canJoinCommunity && (
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="inline-flex h-10 flex-shrink-0 items-center gap-2 rounded-full bg-lime px-4 text-[14px] font-medium text-brand-ink transition-colors hover:bg-lime-dark disabled:opacity-60"
                  >
                    <IconComponent iconName="UserAdd01Icon" size={18} color="currentColor" />
                    Join
                  </button>
                )}
              </div>

              {Boolean(community?.membersCount) && (
                <p className="text-[14px] text-ink-muted">
                  {community?.membersCount} {community?.membersCount === 1 ? 'member' : 'members'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
