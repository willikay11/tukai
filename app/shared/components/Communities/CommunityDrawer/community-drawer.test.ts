import { CommunityMember } from '@/types/community';

import { membershipOf, nameOfMember } from './community-drawer';

const member = (overrides: Partial<CommunityMember> = {}): CommunityMember =>
  ({
    id: 'm1',
    role: 'regular',
    dateCreated: '2026-01-01T00:00:00Z',
    inviteStatus: 'accepted',
    user: { id: 'u1', firstName: 'Amina', lastName: 'Hassan', displayName: '' },
    ...overrides,
  }) as CommunityMember;

describe('membershipOf', () => {
  it('reads no record as no membership', () => {
    expect(membershipOf(undefined)).toBe('none');
  });

  it.each(['requested', 'pending'] as const)('reads %s as pending', (inviteStatus) => {
    expect(membershipOf(member({ inviteStatus }))).toBe('pending');
  });

  it.each(['rejected', 'ignored'] as const)('reads %s as no membership', (inviteStatus) => {
    expect(membershipOf(member({ inviteStatus }))).toBe('none');
  });

  it('reads accepted, or anything else the API sends, as a member', () => {
    expect(membershipOf(member({ inviteStatus: 'accepted' }))).toBe('member');
  });
});

describe('nameOfMember', () => {
  it('prefers the display name', () => {
    expect(nameOfMember(member({ user: { id: 'u1', displayName: 'Ami' } } as never))).toBe('Ami');
  });

  it('falls back to first and last name', () => {
    expect(
      nameOfMember(
        member({
          user: { id: 'u1', firstName: 'Amina', lastName: 'Hassan', displayName: '' },
        } as never),
      ),
    ).toBe('Amina Hassan');
  });

  it('falls back to "Member" where the API sent neither', () => {
    expect(nameOfMember(member({ user: { id: 'u1' } } as never))).toBe('Member');
  });
});
