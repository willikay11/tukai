import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { AuthActions } from './AuthActions';

const mockPush = jest.fn();

const SIGNED_IN = { user: { id: 'u1', name: 'George Ralak', image: null, hasSubscribed: true } };
let session: typeof SIGNED_IN | null = SIGNED_IN;

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: session }),
  signOut: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('next/link', () => {
  // Forward every prop, so class-based assertions see what the app renders
  function MockLink({ children, href, ...rest }: Record<string, unknown>) {
    return (
      <a href={href as string} {...rest}>
        {children as React.ReactNode}
      </a>
    );
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('@/components/ui/image', () => ({
  TukaiImage: ({ alt }: { alt: string }) => <img alt={alt || 'avatar'} />,
}));
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ openSignInWithCallback: jest.fn() }),
}));
jest.mock('@/app/shared/components/Subscription', () => ({
  SubscriptionModalFlow: () => null,
}));
// The dot on Notifications is driven by the real unread count now
jest.mock('@/app/shared/hooks/useNotifications', () => ({
  useUnreadNotificationCount: () => ({ data: { data: { count: 0 } } }),
}));

// The trigger is the button wrapping the user's avatar
const openMenu = () => {
  const trigger = screen.getByAltText('George Ralak').closest('button');
  fireEvent.click(trigger as HTMLElement);
};

describe('AuthActions profile menu', () => {
  it('opens the menu from the avatar trigger', () => {
    render(<AuthActions />);

    expect(screen.queryByText('Control centre')).not.toBeInTheDocument();

    openMenu();

    expect(screen.getByText('Control centre')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  // Regression: the menu used NavigationMenu, whose viewport is hard-anchored
  // left-0. With the avatar at the right edge of the header the panel ran off
  // the right of the screen.
  it('anchors the panel to the end of the trigger so it cannot overflow right', () => {
    render(<AuthActions />);

    openMenu();

    const panel = screen.getByText('Control centre').closest('[data-align]');
    expect(panel).toHaveAttribute('data-align', 'end');
  });
});

// Every control in the header row is 40px, set by the search bar: py-1 around
// an h-8 button. The canvas puts both at 44px, which is h-11.
describe('navbar control heights', () => {
  it('gives Create and the profile trigger the search bar height', () => {
    render(<AuthActions />);

    const create = screen.getByRole('link', { name: /Create/ });
    const trigger = screen.getByAltText('George Ralak').closest('button');

    expect(create).toHaveClass('h-11');
    expect(trigger).toHaveClass('h-11');
  });

  it('no longer sizes Create by padding alone', () => {
    render(<AuthActions />);

    expect(screen.getByRole('link', { name: /Create/ })).not.toHaveClass('py-2');
  });
});

/**
 * Two doors for a visitor with no account yet: one for whoever already has
 * one, and one for whoever does not.
 */
describe('AuthActions, signed out', () => {
  beforeEach(() => {
    session = null;
  });

  afterEach(() => {
    session = SIGNED_IN;
  });

  it('offers a way in and a way to join', () => {
    render(<AuthActions />);

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/auth/sign-in');
    expect(screen.getByText('Create account').closest('a')).toHaveAttribute(
      'href',
      '/auth/sign-up',
    );
  });

  // Offering Create only to answer with a sign-in dialog is a door that opens
  // onto another door
  it('does not offer Create', () => {
    render(<AuthActions />);

    expect(screen.queryByText('Create')).not.toBeInTheDocument();
  });

  it('shows no account menu', () => {
    render(<AuthActions />);

    expect(screen.queryByLabelText('Account menu')).not.toBeInTheDocument();
  });
});

describe('AuthActions, signed in', () => {
  it('offers Create and the account menu, and no sign-in buttons', () => {
    render(<AuthActions />);

    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByLabelText('Account menu')).toBeInTheDocument();
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    expect(screen.queryByText('Create account')).not.toBeInTheDocument();
  });
});
