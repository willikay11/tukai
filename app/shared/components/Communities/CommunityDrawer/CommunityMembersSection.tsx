'use client';

import { useAnswerJoinRequest, useCancelCommunityInvite } from '@/app/shared/hooks/useCommunities';
import { useToast } from '@/app/shared/hooks/useToast';
import { cn } from '@/lib/utils';
import { CommunityMember } from '@/types/community';

import { acceptedMembers, joinRequests, nameOfMember, pendingInvites } from './community-drawer';
import { Avatar, SectionHeading } from './parts';
import { COMMUNITY_SECTIONS, SECTION_SCROLL_MARGIN } from './tabs';

/** Chips shown before the "+{rest}" button takes over. */
const MAX_CHIPS = 9;

const MemberChip = ({ member, role }: { member: CommunityMember; role?: string }) => {
  const name = nameOfMember(member);

  return (
    <span className="inline-flex h-11 max-w-[220px] items-center gap-2 rounded-full bg-surface pl-[5px] pr-4 text-sm text-gray-800">
      <Avatar src={member.user?.picture} name={name} size={34} />
      <span className="min-w-0 truncate">{name}</span>
      {role && <span className="flex-none text-[12.5px] font-semibold text-brand">{role}</span>}
    </span>
  );
};

/** People asking to join, for a host to let in or turn down (DEV-447). */
const JoinRequests = ({
  communityId,
  requests,
}: {
  communityId: string;
  requests: CommunityMember[];
}) => {
  const { toast } = useToast();
  const { mutate: answer, isPending, variables } = useAnswerJoinRequest();

  const respond = (member: CommunityMember, userId: string, verdict: 'accepted' | 'rejected') => {
    const name = nameOfMember(member);
    answer(
      { communityId, userId, answer: verdict },
      {
        onSuccess: () =>
          toast({
            description:
              verdict === 'accepted'
                ? `${name} is in. They can now see everything members do.`
                : `Request from ${name} declined. They can ask again later.`,
          }),
        onError: (error: Error) =>
          toast({
            title: 'Could not answer the request',
            description: error.message,
            variant: 'destructive',
          }),
      },
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-800">
        Asking to join ({requests.length})
      </span>

      {requests.map((request) => {
        const name = nameOfMember(request);
        const userId = request.user?.id as string;
        const isBusy = isPending && variables?.userId === userId;

        return (
          <div key={request.id} className="flex min-h-12 flex-wrap items-center gap-2.5">
            <Avatar src={request.user?.picture} name={name} size={34} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[14.5px] text-gray-800">{name}</span>
              <span className="text-[12.5px] text-ink-muted">Wants to join</span>
            </span>
            <div className="ml-auto flex flex-none gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => respond(request, userId, 'rejected')}
                aria-label={`Decline the request from ${name}`}
                className="h-11 whitespace-nowrap rounded-full bg-surface px-4 text-sm font-semibold text-gray-800 transition-colors hover:bg-surface-muted disabled:opacity-60"
              >
                Decline
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => respond(request, userId, 'accepted')}
                aria-label={`Approve the request from ${name}`}
                className="h-11 whitespace-nowrap rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-4 text-sm font-semibold text-white active:scale-[0.97] disabled:opacity-60"
              >
                Approve
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** An owner's invites nobody has accepted yet, each with a way to take it back. */
const PendingInvites = ({
  communityId,
  invites,
}: {
  communityId: string;
  invites: CommunityMember[];
}) => {
  const { toast } = useToast();
  const { mutate: cancelInvite, isPending, variables } = useCancelCommunityInvite();

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-gray-800">Invited, not joined yet</span>

      {invites.map((invite) => {
        const name = nameOfMember(invite);
        const userId = invite.user?.id;
        // "@" stands in for an invite sent to an email address
        const initial = userId ? name : '@';

        return (
          <div key={invite.id} className="flex min-h-12 items-center gap-2.5">
            <Avatar src={invite.user?.picture} name={initial} size={34} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[14.5px] text-gray-800">{name}</span>
              <span className="text-[12.5px] text-ink-muted">Invite sent</span>
            </span>

            {/* `remove-member` takes a user id, so an invite to an address
                that has no account yet cannot be withdrawn from here */}
            {userId && (
              <button
                type="button"
                disabled={isPending && variables?.userId === userId}
                onClick={() =>
                  cancelInvite(
                    { communityId, userId },
                    {
                      onSuccess: () =>
                        toast({
                          description: `Invite to ${name} cancelled. Their link no longer works.`,
                        }),
                      onError: (error: Error) =>
                        toast({
                          title: 'Could not cancel the invite',
                          description: error.message,
                          variant: 'destructive',
                        }),
                    },
                  )
                }
                aria-label={`Cancel the invite to ${name}`}
                className="h-11 flex-none whitespace-nowrap rounded-full bg-surface px-4 text-sm font-semibold text-danger transition-colors hover:bg-danger-surface disabled:opacity-60"
              >
                Cancel invite
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * The member chips: the admin first ("You" when it is the reader's), then the
 * reader if they are a member, then everyone else - at most 9, and never more
 * than the member count. Owners also see the invites still out.
 */
export const CommunityMembersSection = ({
  communityId,
  communityTitle,
  members,
  memberCount,
  currentUserId,
  isOwnerSelf,
  isHostSelf = isOwnerSelf,
  coHostIds,
}: {
  communityId: string;
  communityTitle: string;
  members: CommunityMember[];
  /** The API's own count, which can run past the records the detail carries. */
  memberCount: number;
  currentUserId?: string;
  isOwnerSelf: boolean;
  /** Owner or co-host: answers join requests (DEV-447) */
  isHostSelf?: boolean;
  /** Labelled Co-host, after the owner (DEV-415) */
  coHostIds?: Set<string>;
}) => {
  const { toast } = useToast();
  const accepted = acceptedMembers(members);

  const owner = accepted.find((member) => member.role === 'owner');
  const self = accepted.find(
    (member) => member.user?.id === currentUserId && member.id !== owner?.id,
  );
  const isCoHost = (member: CommunityMember) =>
    Boolean(member.user?.id && coHostIds?.has(member.user.id));
  const others = accepted.filter((member) => member.id !== owner?.id && member.id !== self?.id);
  const coHosts = others.filter(isCoHost);
  const rest = others.filter((member) => !isCoHost(member));

  const ordered = [
    ...(owner ? [{ member: owner, role: isOwnerSelf ? 'You' : 'Admin' }] : []),
    ...(self ? [{ member: self, role: 'You' }] : []),
    ...coHosts.map((member) => ({ member, role: 'Co-host' })),
    ...rest.map((member) => ({ member, role: undefined })),
  ];

  const visible = ordered.slice(0, Math.min(MAX_CHIPS, memberCount || ordered.length));
  const overflow = Math.max(memberCount - visible.length, 0);
  const invites = isOwnerSelf ? pendingInvites(members) : [];
  const requests = isHostSelf ? joinRequests(members) : [];

  return (
    <section
      id={COMMUNITY_SECTIONS.members}
      className={cn('flex flex-col gap-3.5', SECTION_SCROLL_MARGIN)}
    >
      <SectionHeading
        title="Members"
        sub={`${memberCount} ${memberCount === 1 ? 'member' : 'members'}`}
      />

      {(visible.length > 0 || overflow > 0) && (
        <div className="flex flex-wrap gap-2">
          {visible.map(({ member, role }) => (
            <MemberChip key={member.id} member={member} role={role} />
          ))}

          {overflow > 0 && (
            <button
              type="button"
              onClick={() =>
                toast({ description: `Opens all ${memberCount} members of ${communityTitle}.` })
              }
              aria-label={`See all ${memberCount} members`}
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-full bg-surface-brand px-3.5 text-sm font-bold text-brand transition-colors hover:bg-surface-tab"
            >
              +{overflow}
            </button>
          )}
        </div>
      )}

      {requests.length > 0 && <JoinRequests communityId={communityId} requests={requests} />}
      {invites.length > 0 && <PendingInvites communityId={communityId} invites={invites} />}
    </section>
  );
};
