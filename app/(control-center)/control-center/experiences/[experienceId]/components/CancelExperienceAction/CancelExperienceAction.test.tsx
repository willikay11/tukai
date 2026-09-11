import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CancelExperienceAction } from './index';

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const cancelExperience = jest.fn();
let isPending = false;
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useCancelExperience: () => ({ mutate: cancelExperience, isPending }),
}));

const renderAction = () =>
  render(<CancelExperienceAction experienceId="exp-1" experienceTitle="Karura Night Hike" />);

const openConfirm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: 'Cancel Experience' }));
};

describe('CancelExperienceAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    isPending = false;
  });

  // Refunds cannot be undone from here, so the destructive step is confirmed
  it('asks before cancelling, and says refunds follow', async () => {
    const user = userEvent.setup();
    renderAction();

    await openConfirm(user);

    expect(screen.getByText('Cancel this experience?')).toBeInTheDocument();
    expect(screen.getByText(/everyone who has already paid will be refunded/)).toBeInTheDocument();
    expect(cancelExperience).not.toHaveBeenCalled();
  });

  it('cancels once confirmed', async () => {
    const user = userEvent.setup();
    renderAction();

    await openConfirm(user);
    await user.click(screen.getByRole('button', { name: 'Cancel experience' }));

    expect(cancelExperience).toHaveBeenCalled();
  });

  // The same modal the create flow ends on
  it('confirms success with the modal rather than a toast', async () => {
    cancelExperience.mockImplementation(
      (_input: unknown, { onSuccess }: { onSuccess: () => void }) => onSuccess(),
    );
    const user = userEvent.setup();
    renderAction();

    await openConfirm(user);
    await user.click(screen.getByRole('button', { name: 'Cancel experience' }));

    expect(await screen.findByText('Experience Cancelled Successfully')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to Creator Studio' })).toHaveAttribute(
      'href',
      '/creator-studio',
    );
    expect(toast).not.toHaveBeenCalled();
  });

  it('reports a failure and leaves the experience alone', async () => {
    cancelExperience.mockImplementation(
      (_input: unknown, { onError }: { onError: (error: Error) => void }) =>
        onError(new Error('Tickets have already been redeemed')),
    );
    const user = userEvent.setup();
    renderAction();

    await openConfirm(user);
    await user.click(screen.getByRole('button', { name: 'Cancel experience' }));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Tickets have already been redeemed' }),
      ),
    );
    expect(screen.queryByText('Experience Cancelled Successfully')).not.toBeInTheDocument();
  });
});
