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

/**
 * The community detail endpoint hands over every member in one payload — there
 * is no cap on it — so a large community rendered as one unbroken wall of
 * rows. The dedicated `/communities/{id}/members/` endpoint is paginated, but
 * it needs a token and this page is public, so the paging happens here.
 */
describe('paging the member list', () => {
  const many = (count: number) =>
    Array.from({ length: count }, (_, index) => member(`r${index}`, `Member ${index}`, 'regular'));

  const withAdmins = (count: number) => [member('a', 'Lily', 'owner'), ...many(count)];

  it('shows the first page only', () => {
    render(<MembersSection members={withAdmins(20)} />);

    expect(screen.getByText('Member 0')).toBeInTheDocument();
    expect(screen.getByText('Member 7')).toBeInTheDocument();
    expect(screen.queryByText('Member 8')).not.toBeInTheDocument();
  });

  it('counts every member, not just the page', () => {
    render(<MembersSection members={withAdmins(20)} />);

    expect(screen.getByText('Members (20)')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
  });

  it('moves through the pages', async () => {
    const user = userEvent.setup();
    render(<MembersSection members={withAdmins(20)} />);

    await user.click(screen.getByRole('button', { name: 'Next page of members' }));

    expect(screen.getByText('Member 8')).toBeInTheDocument();
    expect(screen.queryByText('Member 0')).not.toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Previous page of members' }));

    expect(screen.getByText('Member 0')).toBeInTheDocument();
  });

  it('stops at each end', async () => {
    const user = userEvent.setup();
    render(<MembersSection members={withAdmins(20)} />);

    expect(screen.getByRole('button', { name: 'Previous page of members' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Next page of members' }));
    await user.click(screen.getByRole('button', { name: 'Next page of members' }));

    expect(screen.getByRole('button', { name: 'Next page of members' })).toBeDisabled();
  });

  // Administrators head the section and are a handful; they are not paged
  it('leaves the administrators whole', () => {
    render(<MembersSection members={withAdmins(20)} />);

    expect(screen.getByText('Lily')).toBeInTheDocument();
  });

  it('offers no controls for a list that fits on one page', () => {
    render(<MembersSection members={withAdmins(5)} />);

    expect(screen.queryByRole('button', { name: /page of members/ })).not.toBeInTheDocument();
  });

  // A search run from a later page used to strand the reader past the end
  it('returns to the first page when the search changes', async () => {
    const user = userEvent.setup();
    render(<MembersSection members={withAdmins(20)} />);

    await user.click(screen.getByRole('button', { name: 'Next page of members' }));
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Find a member'), 'Member 1');

    expect(screen.getByText('Member 1')).toBeInTheDocument();
  });
});
