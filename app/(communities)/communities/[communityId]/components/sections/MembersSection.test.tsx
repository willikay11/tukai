import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CommunityMember } from '@/types/community';

import { MembersSection } from './MembersSection';

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ fallback }: Record<string, unknown>) => <span>{fallback as React.ReactNode}</span>,
}));

const member = (id: string, name: string, role: string): CommunityMember =>
  ({
    id,
    role,
    user: { id: `u-${id}`, displayName: name, picture: null },
  }) as unknown as CommunityMember;

const MEMBERS = [
  member('1', 'Lily', 'owner'),
  member('2', 'Tony', 'admin'),
  member('3', 'Ben', 'regular'),
  member('4', 'Cara', 'regular'),
];

describe('MembersSection', () => {
  it('separates administrators from members', () => {
    render(<MembersSection members={MEMBERS} />);

    expect(screen.getByText('Administrators')).toBeInTheDocument();
    expect(screen.getByText('Members (2)')).toBeInTheDocument();
  });

  it('counts owners and admins as administrators', () => {
    render(<MembersSection members={MEMBERS} />);

    // Message is the admin action; Follow is the member action
    expect(screen.getAllByRole('button', { name: 'Message' })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: 'Follow' })).toHaveLength(2);
  });

  it('filters by the search box', async () => {
    const user = userEvent.setup();
    render(<MembersSection members={MEMBERS} />);

    await user.type(screen.getByPlaceholderText('Find a member'), 'ben');

    expect(screen.getByText('Ben')).toBeInTheDocument();
    expect(screen.queryByText('Cara')).not.toBeInTheDocument();
  });

  it('says so when the search matches nobody', async () => {
    const user = userEvent.setup();
    render(<MembersSection members={MEMBERS} />);

    await user.type(screen.getByPlaceholderText('Find a member'), 'zzz');

    expect(screen.getByText('No members matching "zzz"')).toBeInTheDocument();
  });

  // ⚠️ Neither follow nor messaging has an endpoint, so the buttons must not
  // look actionable
  it('disables Follow and Message, which have no backend', () => {
    render(<MembersSection members={MEMBERS} />);

    screen.getAllByRole('button', { name: 'Follow' }).forEach((button) => {
      expect(button).toBeDisabled();
    });
    screen.getAllByRole('button', { name: 'Message' }).forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('fills each row rather than outlining it', () => {
    const { container } = render(<MembersSection members={MEMBERS} />);

    const row = screen.getByText('Ben').closest('div');
    expect(row).toHaveClass('bg-gray-50');
    expect(container.querySelector('.border-gray-100')).not.toBeInTheDocument();
  });

  it('copes with an empty community', () => {
    render(<MembersSection members={[]} />);

    expect(screen.getByText('No members yet')).toBeInTheDocument();
  });

  it('hides the administrators group when there are none', () => {
    render(<MembersSection members={[member('3', 'Ben', 'regular')]} />);

    expect(screen.queryByText('Administrators')).not.toBeInTheDocument();
    expect(screen.getByText('Members (1)')).toBeInTheDocument();
  });
});
