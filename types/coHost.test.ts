import { CoHostInvite, coHostInviteStatusLabel, openCoHostInvites } from './coHost';

const invite = (overrides: Partial<CoHostInvite> = {}): CoHostInvite => ({
  id: 1,
  invitedUser: { id: 'u1', displayName: 'Kevo' },
  status: 'PENDING',
  ...overrides,
});

describe('coHostInviteStatusLabel', () => {
  // A host needs to know an invite is not an acceptance
  it('says an invite is still waiting', () => {
    expect(coHostInviteStatusLabel('PENDING')).toBe('Waiting for them to accept');
  });

  it.each([
    ['ACCEPTED', 'Accepted'],
    ['DECLINED', 'Declined'],
    ['REMOVED', 'Withdrawn'],
  ] as const)('reads %s back as %s', (status, expected) => {
    expect(coHostInviteStatusLabel(status)).toBe(expected);
  });
});

describe('openCoHostInvites', () => {
  it('keeps what is still waiting and what was turned down', () => {
    const invites = [
      invite(),
      invite({ id: 2, status: 'DECLINED' }),
      // An accepted invite is a co-host, and shows in that list instead
      invite({ id: 3, status: 'ACCEPTED' }),
      invite({ id: 4, status: 'REMOVED' }),
    ];

    expect(openCoHostInvites(invites).map((one) => one.id)).toEqual([1, 2]);
  });
});
