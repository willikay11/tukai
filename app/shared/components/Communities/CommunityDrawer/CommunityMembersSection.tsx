'use client';

import { useCancelCommunityInvite } from '@/app/shared/hooks/useCommunities';
import { useToast } from '@/app/shared/hooks/useToast';
import { cn } from '@/lib/utils';
import { CommunityMember } from '@/types/community';

import { acceptedMembers, nameOfMember, pendingInvites } from './community-drawer';
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
}: {
  communityId: string;
  communityTitle: string;
  members: CommunityMember[];
  /** The API's own count, which can run past the records the detail carries. */
  memberCount: number;
  currentUserId?: string;
  isOwnerSelf: boolean;
}) => {
  const { toast } = useToast();
  const accepted = acceptedMembers(members);

  const owner = accepted.find((member) => member.role === 'owner');
  const self = accepted.find(
    (member) => member.user?.id === currentUserId && member.id !== owner?.id,
  );
  const rest = accepted.filter((member) => member.id !== owner?.id && member.id !== self?.id);

  const ordered = [
    ...(owner ? [{ member: owner, role: isOwnerSelf ? 'You' : 'Admin' }] : []),
    ...(self ? [{ member: self, role: 'You' }] : []),
    ...rest.map((member) => ({ member, role: undefined })),
  ];

  const visible = ordered.slice(0, Math.min(MAX_CHIPS, memberCount || ordered.length));
  const overflow = Math.max(memberCount - visible.length, 0);
  const invites = isOwnerSelf ? pendingInvites(members) : [];

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

      {invites.length > 0 && <PendingInvites communityId={communityId} invites={invites} />}
    </section>
  );
};
