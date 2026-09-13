import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BucketListButton } from './index';

let sessionState: { data: { user: { id: string } } | null } = { data: { user: { id: 'u1' } } };
jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));

const openSignInWithCallback = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ openSignInWithCallback, setOpenSignIn: jest.fn() }),
}));

jest.mock('@/app/shared/components/BucketList', () => ({
  BucketListPicker: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="picker" /> : null,
}));

describe('BucketListButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionState = { data: { user: { id: 'u1' } } };
  });

  it('opens the picker for a signed-in reader', async () => {
    const user = userEvent.setup();
    render(<BucketListButton experienceId="exp-1" isBookmarked={false} />);

    await user.click(screen.getByRole('button', { name: /Add to Bucket List/ }));

    expect(screen.getByTestId('picker')).toBeInTheDocument();
  });

  it('signs a reader in first, then opens the picker', async () => {
    sessionState = { data: null };
    const user = userEvent.setup();
    render(<BucketListButton experienceId="exp-1" isBookmarked={false} />);

    await user.click(screen.getByRole('button', { name: /Add to Bucket List/ }));

    expect(screen.queryByTestId('picker')).not.toBeInTheDocument();
    expect(openSignInWithCallback).toHaveBeenCalled();

    // What signing in runs
    openSignInWithCallback.mock.calls[0][0]();
    expect(await screen.findByTestId('picker')).toBeInTheDocument();
  });

  it('does nothing in the create-flow preview', async () => {
    const user = userEvent.setup();
    render(<BucketListButton experienceId="exp-1" isBookmarked={false} inert />);

    await user.click(screen.getByRole('button', { name: /Add to Bucket List/ }));

    expect(screen.queryByTestId('picker')).not.toBeInTheDocument();
  });
});
