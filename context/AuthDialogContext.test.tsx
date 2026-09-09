import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthDialogProvider, useAuthDialog } from './AuthDialogContext';

const back = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ back, push: jest.fn() }) }));

const onLoginHolder: { fire?: () => void } = {};
// Only the card is stubbed: the box around it is the real one, so the dialog
// still behaves like a dialog — Escape closes it, and it carries its own role
jest.mock('@/app/shared/components/Auth', () => ({
  ...jest.requireActual('@/app/shared/components/Auth'),
  AuthCard: ({ onLogin }: { onLogin: () => void }) => {
    onLoginHolder.fire = onLogin;
    return <div data-testid="sign-in-form" />;
  },
}));

jest.mock('@/app/shared/hooks/useToast', () => ({ toast: jest.fn() }));

const continued = jest.fn();

const Opener = () => {
  const { openSignInWithCallback } = useAuthDialog();

  return <button onClick={() => openSignInWithCallback(continued)}>Reserve</button>;
};

const renderWithProvider = () =>
  render(
    <AuthDialogProvider>
      <Opener />
    </AuthDialogProvider>,
  );

describe('AuthDialogProvider', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens over whatever asked for it', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'Reserve' }));

    expect(screen.getByTestId('sign-in-form')).toBeInTheDocument();
  });

  // What makes the flow one press rather than two journeys
  it('runs what the reader was doing once they are in', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'Reserve' }));
    onLoginHolder.fire?.();

    expect(continued).toHaveBeenCalled();
  });

  /**
   * It used to call router.back() on close, so a reader who opened this from a
   * place page and changed their mind was navigated off the page they were on.
   */
  it('closing only closes, and does not navigate', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'Reserve' }));
    await user.keyboard('{Escape}');

    expect(back).not.toHaveBeenCalled();
    expect(screen.queryByTestId('sign-in-form')).not.toBeInTheDocument();
  });

  // Otherwise dismissing and later signing in would fire the old intent
  it('forgets what was pending when it is dismissed', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('button', { name: 'Reserve' }));
    await user.keyboard('{Escape}');
    onLoginHolder.fire?.();

    expect(continued).not.toHaveBeenCalled();
  });
});
