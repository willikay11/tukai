import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { signIn, useSession } from 'next-auth/react';

import { AuthDialogProvider, useAuthDialog } from './AuthDialogContext';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signIn: jest.fn(),
  getSession: jest.fn().mockResolvedValue({ user: { name: 'Wanjiku Kamau' } }),
}));

// The dialog and nudge UI are exercised by their own component tests - here
// only the state machine (needAuth, close, the pending callback) is under test
jest.mock('@/app/shared/components/Auth/AuthDialog/AuthFlowDialog', () => ({
  AuthFlowDialog: () => null,
}));
jest.mock('@/app/shared/components/Auth/AuthDialog/SignInNudge', () => ({
  SignInNudge: () => null,
}));

const mockUseSession = useSession as jest.Mock;
const mockSignIn = signIn as jest.Mock;

const continued = jest.fn();

const Opener = () => {
  const { needAuth } = useAuthDialog();
  return <button onClick={() => needAuth('reserve', continued)}>Reserve</button>;
};

const ViewProbe = () => {
  const { view, why, close } = useAuthDialog();
  return (
    <div>
      <span data-testid="view">{view ?? 'none'}</span>
      <span data-testid="why">{why}</span>
      <button onClick={close}>Close dialog</button>
    </div>
  );
};

const renderWithProvider = (children: React.ReactNode) =>
  render(<AuthDialogProvider>{children}</AuthDialogProvider>);

describe('AuthDialogProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated', update: jest.fn() });
  });

  it('opens Create account with the reason pill for a signed-out reader', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <>
        <Opener />
        <ViewProbe />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Reserve' }));

    expect(screen.getByTestId('view')).toHaveTextContent('register');
    expect(screen.getByTestId('why')).toHaveTextContent(
      'Booking needs an account, so your bookings stay with you.',
    );
  });

  it('does nothing for a reader who is already signed in', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'u1' } },
      status: 'authenticated',
      update: jest.fn(),
    });
    const user = userEvent.setup();
    renderWithProvider(
      <>
        <Opener />
        <ViewProbe />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Reserve' }));

    expect(screen.getByTestId('view')).toHaveTextContent('none');
    expect(continued).not.toHaveBeenCalled();
  });

  // What makes the flow one press rather than two journeys
  it('runs what the reader was doing once a credentials sign-in succeeds', async () => {
    mockSignIn.mockResolvedValue({ status: 200, ok: true });
    const user = userEvent.setup();

    const SignInFlow = () => {
      const { needAuth, email, password, setEmail, setPassword, submitSignInEmailForm } =
        useAuthDialog();
      return (
        <>
          <button onClick={() => needAuth('reserve', continued)}>Reserve</button>
          <input aria-label="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            aria-label="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={() => void submitSignInEmailForm()}>Sign in</button>
        </>
      );
    };

    renderWithProvider(<SignInFlow />);

    await user.click(screen.getByRole('button', { name: 'Reserve' }));
    await user.type(screen.getByLabelText('email'), 'reader@example.com');
    await user.type(screen.getByLabelText('password'), 'hunter22');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    // The resume runs on a short timeout so the dialog finishes closing first
    await waitFor(() => expect(continued).toHaveBeenCalled());
  });

  it('closing drops whatever was pending, so a later sign-in does not run it', async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <>
        <Opener />
        <ViewProbe />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Reserve' }));
    await user.click(screen.getByRole('button', { name: 'Close dialog' }));

    expect(screen.getByTestId('view')).toHaveTextContent('none');
    expect(continued).not.toHaveBeenCalled();
  });

  it('openSignIn and openRegister open the matching view with no reason pill', async () => {
    const user = userEvent.setup();

    const Triggers = () => {
      const { openSignIn, openRegister } = useAuthDialog();
      return (
        <>
          <button onClick={openSignIn}>Sign in</button>
          <button onClick={openRegister}>Create account</button>
        </>
      );
    };

    renderWithProvider(
      <>
        <Triggers />
        <ViewProbe />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(screen.getByTestId('view')).toHaveTextContent('signin');
    expect(screen.getByTestId('why')).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(screen.getByTestId('view')).toHaveTextContent('register');
  });
});
