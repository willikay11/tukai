import { LinkedUser } from '@/types/user';

/**
 * A co-host invite.
 *
 * Inviting a co-host does not make them one: the API records a PENDING invite
 * and waits for them to accept. So a host reads two lists - who is a co-host,
 * and who has been asked - and REMOVED is an invite the host withdrew.
 */
export type CoHostInviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REMOVED';

export type CoHostInvite = {
  // The only integer id on the experience endpoints; everything else is a uuid
  id: number;
  invitedUser: LinkedUser;
  status: CoHostInviteStatus;
  dateCreated?: string;
  respondedAt?: string | null;
};

/** What a host is told about an invite that has not been accepted. */
export const coHostInviteStatusLabel = (status: CoHostInviteStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'Waiting for them to accept';
    case 'ACCEPTED':
      return 'Accepted';
    case 'DECLINED':
      return 'Declined';
    default:
      return 'Withdrawn';
  }
};

/** The ones still worth showing a host: asked, or turned down. */
export const openCoHostInvites = (invites: CoHostInvite[]): CoHostInvite[] =>
  invites.filter((invite) => invite.status === 'PENDING' || invite.status === 'DECLINED');
