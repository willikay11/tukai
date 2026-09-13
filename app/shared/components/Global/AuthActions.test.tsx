import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { AuthActions } from './AuthActions';

const mockPush = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'u1', name: 'George Ralak', image: null, hasSubscribed: true } },
  }),
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

// The trigger is the button wrapping the user's avatar
const openMenu = () => {
  const trigger = screen.getByAltText('George Ralak').closest('button');
  fireEvent.click(trigger as HTMLElement);
};

describe('AuthActions profile menu', () => {
  it('opens the menu from the avatar trigger', () => {
    render(<AuthActions />);

    expect(screen.queryByText('My Profile')).not.toBeInTheDocument();

    openMenu();

    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  // Regression: the menu used NavigationMenu, whose viewport is hard-anchored
  // left-0. With the avatar at the right edge of the header the panel ran off
  // the right of the screen.
  it('anchors the panel to the end of the trigger so it cannot overflow right', () => {
    render(<AuthActions />);

    openMenu();

    const panel = screen.getByText('My Profile').closest('[data-align]');
    expect(panel).toHaveAttribute('data-align', 'end');
  });
});

// Every control in the header row is 40px, set by the search bar: py-1 around
// an h-8 button. AskTukaiButton matches at h-10 w-10.
describe('navbar control heights', () => {
  it('gives Create and the profile trigger the search bar height', () => {
    render(<AuthActions />);

    const create = screen.getByRole('link', { name: /Create/ });
    const trigger = screen.getByAltText('George Ralak').closest('button');

    expect(create).toHaveClass('h-10');
    expect(trigger).toHaveClass('h-10');
  });

  it('no longer sizes Create by padding alone', () => {
    render(<AuthActions />);

    expect(screen.getByRole('link', { name: /Create/ })).not.toHaveClass('py-2');
  });
});
