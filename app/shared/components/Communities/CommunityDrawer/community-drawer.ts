import { CommunityMember } from '@/types/community';

export type CommunityMembership = 'none' | 'pending' | 'member';

/**
 * A join request on a public community is accepted immediately; on a private
 * one it is only recorded as `requested` until a host approves it. A record
 * whose status the API leaves out still counts as a member - membership is
 * what having the record means.
 */
export const membershipOf = (member?: CommunityMember): CommunityMembership => {
  if (!member) return 'none';
  if (member.inviteStatus === 'requested' || member.inviteStatus === 'pending') return 'pending';
  if (member.inviteStatus === 'rejected' || member.inviteStatus === 'ignored') return 'none';
  return 'member';
};

export const nameOfMember = (member: CommunityMember): string =>
  member.user?.displayName ||
  `${member.user?.firstName ?? ''} ${member.user?.lastName ?? ''}`.trim() ||
  'Member';
