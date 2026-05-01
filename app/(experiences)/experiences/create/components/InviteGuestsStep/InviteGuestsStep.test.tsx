import { render, screen } from '@testing-library/react';
import { InviteGuestsStep } from './InviteGuestsStep';

jest.mock('../invites', () => ({
  CreateExperienceInvites: ({ onInvitesChange }: any) => (
    <div data-testid="create-experience-invites">
      <button onClick={() => onInvitesChange([], [])}>Test Invites</button>
    </div>
  ),
}));

describe('InviteGuestsStep', () => {
  const defaultProps = {
    formData: {
      invitedGuests: [],
      invitedCommunityIds: [],
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
});
