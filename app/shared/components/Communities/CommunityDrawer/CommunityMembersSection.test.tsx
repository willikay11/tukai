import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CommunityMember } from '@/types/community';

import { CommunityMembersSection } from './CommunityMembersSection';

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const member = (id: string, name: string, role: CommunityMember['role'] = 'regular') =>
  ({ id, role, user: { id: `u-${id}`, displayName: name } }) as CommunityMember;

describe('CommunityMembersSection', () => {
  it('shows nothing-yet where the community has no members', () => {
    render(<CommunityMembersSection members={[]} />);

    expect(screen.getByText('No members yet')).toBeInTheDocument();
  });

  it('splits administrators from regular members', () => {
    render(
      <CommunityMembersSection
        members={[
          member('1', 'Amina Hassan', 'owner'),
          member('2', 'Kevo Otieno', 'admin'),
          member('3', 'Tony Ouma', 'regular'),
        ]}
      />,
    );

    expect(screen.getByText('Administrators')).toBeInTheDocument();
    expect(screen.getByText('Amina Hassan')).toBeInTheDocument();
    expect(screen.getByText('Kevo Otieno')).toBeInTheDocument();
    expect(screen.getByText('Members (1)')).toBeInTheDocument();
    expect(screen.getByText('Tony Ouma')).toBeInTheDocument();
  });

  it('filters by name as the reader types', async () => {
    render(
      <CommunityMembersSection
        members={[member('1', 'Amina Hassan'), member('2', 'Kevo Otieno')]}
      />,
    );

    await userEvent.type(screen.getByPlaceholderText('Find a member'), 'Kevo');

    expect(screen.getByText('Kevo Otieno')).toBeInTheDocument();
    expect(screen.queryByText('Amina Hassan')).not.toBeInTheDocument();
  });

  it('says so where a search matches nobody', async () => {
    render(<CommunityMembersSection members={[member('1', 'Amina Hassan')]} />);

    await userEvent.type(screen.getByPlaceholderText('Find a member'), 'Zzz');

    expect(screen.getByText('No members matching "Zzz"')).toBeInTheDocument();
  });

  it('holds a long roster behind "Show N more"', async () => {
    const members = Array.from({ length: 10 }, (_, index) => member(`${index}`, `Member ${index}`));
    render(<CommunityMembersSection members={members} />);

    expect(screen.queryByText('Member 9')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show 2 more' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Show 2 more' }));

    expect(screen.getByText('Member 9')).toBeInTheDocument();
  });
});
