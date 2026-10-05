import { useState } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { InviteMembers, type InvitedMember } from './invite-members';

// Controlled, like the real callers - the component reads back what it added,
// which is what makes duplicate detection and batching observable
const Harness = ({
  initial = [],
  onChange,
  ...props
}: {
  initial?: InvitedMember[];
  onChange: (members: InvitedMember[]) => void;
} & Partial<React.ComponentProps<typeof InviteMembers>>) => {
  const [members, setMembers] = useState<InvitedMember[]>(initial);

  return (
    <InviteMembers
      {...props}
      invitedMembers={members}
      onMembersChange={(next) => {
        setMembers(next);
        onChange(next);
      }}
      placeholder="Add guest emails, separated by commas"
    />
  );
};

const setup = (props: Partial<React.ComponentProps<typeof Harness>> = {}) => {
  const onMembersChange = jest.fn();
  render(<Harness onChange={onMembersChange} {...props} />);
  return {
    onMembersChange,
    input: screen.getByPlaceholderText('Add guest emails, separated by commas'),
  };
};

const emailsFrom = (mock: jest.Mock) =>
  (mock.mock.calls.at(-1)?.[0] as InvitedMember[]).map((member) => member.email);

describe('InviteMembers - entering emails', () => {
  it('adds an address on Enter', async () => {
    const user = userEvent.setup();
    const { onMembersChange, input } = setup();

    await user.type(input, 'tony@example.com{Enter}');

    expect(emailsFrom(onMembersChange)).toEqual(['tony@example.com']);
    expect(input).toHaveValue('');
  });

  it('commits an address as soon as a comma is typed', async () => {
    const user = userEvent.setup();
    const { onMembersChange, input } = setup();

    await user.type(input, 'tony@example.com,');

    expect(emailsFrom(onMembersChange)).toEqual(['tony@example.com']);
  });

  it('accepts several comma-separated addresses at once', async () => {
    const user = userEvent.setup();
    const { onMembersChange, input } = setup();

    await user.click(input);
    await user.paste('a@example.com, b@example.com, c@example.com');
    await user.type(input, '{Enter}');

    expect(emailsFrom(onMembersChange)).toEqual([
      'a@example.com',
      'b@example.com',
      'c@example.com',
    ]);
  });

  it('reports an invalid address and keeps it for correction', async () => {
    const user = userEvent.setup();
    const { onMembersChange, input } = setup();

    await user.type(input, 'not-an-email{Enter}');

    expect(onMembersChange).not.toHaveBeenCalled();
    expect(screen.getByText(/is not a valid email/i)).toBeInTheDocument();
    expect(input).toHaveValue('not-an-email');
  });

  it('adds the valid half of a mixed batch and keeps the rest', async () => {
    const user = userEvent.setup();
    const { onMembersChange, input } = setup();

    await user.type(input, 'good@example.com,oops,{Enter}');

    expect(emailsFrom(onMembersChange)).toEqual(['good@example.com']);
    expect(input).toHaveValue('oops');
  });

  it('ignores an address that is already invited', async () => {
    const user = userEvent.setup();
    const { onMembersChange, input } = setup({
      initial: [{ id: '1', name: 'tony@example.com', email: 'tony@example.com' }],
    });

    await user.type(input, 'TONY@example.com{Enter}');

    expect(onMembersChange).not.toHaveBeenCalled();
  });

  it('does not show a results dropdown when no search is wired up', async () => {
    const user = userEvent.setup();
    const { input } = setup();

    await user.type(input, 'tony');

    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
    expect(screen.queryByText('Invite via email')).not.toBeInTheDocument();
  });

  it('still offers search results when a handler is provided', async () => {
    const user = userEvent.setup();
    const { input } = setup({
      onSearch: jest.fn(),
      searchResults: [{ id: 'u1', name: 'Tony Ouma', email: 'tony@example.com' }],
    });

    await user.type(input, 'tony');

    expect(await screen.findByText('Tony Ouma')).toBeInTheDocument();
  });
});

/**
 * From inviteVm: Enter takes the first suggestion, and a search that finds
 * nobody says what to do about it rather than only that it failed.
 */
describe('InviteMembers - searching for people', () => {
  const RESULTS = [
    { id: 'u1', name: 'Kimberly Achieng', email: 'kim@example.com' },
    { id: 'u2', name: 'Kevin Mwangi', email: 'kevin@example.com' },
  ];

  it('adds the first match on Enter, rather than the half-typed name', async () => {
    const user = userEvent.setup();
    const { onMembersChange, input } = setup({ searchResults: RESULTS });

    await user.type(input, 'Kim');
    await user.keyboard('{Enter}');

    const added = onMembersChange.mock.calls.at(-1)?.[0] as InvitedMember[];
    expect(added.map((member) => member.name)).toContain('Kimberly Achieng');
  });

  // Nobody matched, so the typed text is the email it looks like
  it('still takes an email when nothing matches', async () => {
    const user = userEvent.setup();
    const { onMembersChange, input } = setup({ searchResults: [] });

    await user.type(input, 'someone@example.com');
    await user.keyboard('{Enter}');

    expect(emailsFrom(onMembersChange)).toContain('someone@example.com');
  });

  it('tells the reader what to do when nobody matches', async () => {
    const user = userEvent.setup();
    const { input } = setup({ searchResults: [], onSearch: jest.fn() });

    await user.type(input, 'Zzz');

    expect(
      screen.getByText(/No one on Tukai matches .*Zzz.*\. Add their email address instead\./),
    ).toBeInTheDocument();
  });
});
