import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CommunityMember } from '@/types/community';

import { CommunityMembersSection } from './CommunityMembersSection';

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const member = (
  id: string,
  name: string,
  role: CommunityMember['role'] = 'regular',
  userId = `u-${id}`,
) => ({ id, role, user: { id: userId, displayName: name } }) as CommunityMember;

describe('CommunityMembersSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('says so where the community has no members', () => {
    render(<CommunityMembersSection members={[]} />);

    expect(screen.getByText('No members yet.')).toBeInTheDocument();
  });

  it('shows the owner first, labelled Admin, then the rest', () => {
    render(
      <CommunityMembersSection
        members={[
          member('1', 'Amina Hassan', 'owner'),
          member('2', 'Kevo Otieno', 'regular'),
          member('3', 'Tony Ouma', 'regular'),
        ]}
      />,
    );

    expect(screen.getByText('3 members')).toBeInTheDocument();
    expect(screen.getByText('Amina Hassan')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Kevo Otieno')).toBeInTheDocument();
    expect(screen.getByText('Tony Ouma')).toBeInTheDocument();
  });

  it("labels the owner's own chip You instead of Admin", () => {
    render(
      <CommunityMembersSection
        members={[member('1', 'Amina Hassan', 'owner', 'me')]}
        currentUserId="me"
      />,
    );

    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it("shows a signed-in member's own chip as You, separate from the owner", () => {
    render(
      <CommunityMembersSection
        members={[
          member('1', 'Amina Hassan', 'owner'),
          member('2', 'Kevo Otieno', 'regular', 'me'),
        ]}
        currentUserId="me"
      />,
    );

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('holds a long roster behind a "+N" chip that toasts for now', async () => {
    const members = Array.from({ length: 12 }, (_, index) => member(`${index}`, `Member ${index}`));
    render(<CommunityMembersSection members={members} />);

    const overflow = screen.getByRole('button', { name: 'See all 12 members' });
    expect(overflow).toHaveTextContent('+3');

    await userEvent.click(overflow);

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'See all 12 members' }),
    );
  });
});
