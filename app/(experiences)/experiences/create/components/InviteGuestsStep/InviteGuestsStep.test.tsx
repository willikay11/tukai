import { render, screen } from '@testing-library/react';

import { InviteGuestsStep } from './index';

const community = {
  id: 'community-1',
  title: 'Hiking Club',
  photos: [{ photo: 'https://example.com/cover.jpg', isCover: true }],
};

jest.mock('../invites', () => ({
  CreateExperienceInvites: ({ onInvitesChange }: any) => (
    <div data-testid="create-experience-invites">
      <button onClick={() => onInvitesChange([], [])}>Test Invites</button>
      <button
        onClick={() =>
          onInvitesChange([{ id: 'user-1', name: 'Ada', email: 'ada@example.com' }], [community])
        }
      >
        Invite Community
      </button>
    </div>
  ),
}));

describe('InviteGuestsStep', () => {
  const defaultProps = {
    formData: {
      invitedGuests: [],
      invitedCommunityIds: [],
      invitedCommunities: [],
    },
    onChange: jest.fn(),
    experienceId: '123',
  };

  it('renders CreateExperienceInvites component', () => {
    render(<InviteGuestsStep {...defaultProps} />);
    expect(screen.getByTestId('create-experience-invites')).toBeInTheDocument();
  });

  it('calls onChange when invites are updated', () => {
    render(<InviteGuestsStep {...defaultProps} />);
    const button = screen.getByText('Test Invites');
    button.click();
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  // The invite step lists communities the user follows, while the rest of the
  // flow only knows the ones they created — so the invited community itself has
  // to be carried through for the preview to render it
  it('stores the invited communities alongside their ids', () => {
    const onChange = jest.fn();
    render(<InviteGuestsStep {...defaultProps} onChange={onChange} />);

    screen.getByText('Invite Community').click();

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        invitedCommunityIds: ['community-1'],
        invitedCommunities: [
          { id: 'community-1', name: 'Hiking Club', imageUrl: 'https://example.com/cover.jpg' },
        ],
      }),
    );
  });

  it('passes the invited guests through unchanged', () => {
    const onChange = jest.fn();
    render(<InviteGuestsStep {...defaultProps} onChange={onChange} />);

    screen.getByText('Invite Community').click();

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        invitedGuests: [{ id: 'user-1', name: 'Ada', email: 'ada@example.com' }],
      }),
    );
  });
});
