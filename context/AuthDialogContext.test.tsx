import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

const renderWithProvider = (children: React.ReactNode) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AuthDialogProvider>{children}</AuthDialogProvider>
    </QueryClientProvider>,
  );
  return queryClient;
};

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

  // The Profile page's "My interests" reads off its own `['profile', userId]`
  // query, not the session - this is what keeps that section current once the
  // shared interests modal (opened with `openEditInterests`) saves.
  it('invalidates the cached profile once an edit is saved, so that section refreshes', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: 'u1', interests: [{ id: 'i1', name: 'Hiking' }] } },
      status: 'authenticated',
      update: jest.fn(),
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 200 }),
    }) as jest.Mock;

    const user = userEvent.setup();

    const EditInterestsFlow = () => {
      const { openEditInterests, toggleInterest, submitInterests } = useAuthDialog();
      return (
        <>
          <button onClick={openEditInterests}>Edit interests</button>
          <button onClick={() => toggleInterest('i2')}>Toggle i2</button>
          <button onClick={() => void submitInterests()}>Save interests</button>
        </>
      );
    };

    const queryClient = renderWithProvider(<EditInterestsFlow />);
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    await user.click(screen.getByRole('button', { name: 'Edit interests' }));
    await user.click(screen.getByRole('button', { name: 'Toggle i2' }));
    await user.click(screen.getByRole('button', { name: 'Save interests' }));

    await waitFor(() =>
      expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['profile', 'u1'] }),
    );
  });
});
