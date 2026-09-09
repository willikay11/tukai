import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthCard } from './AuthCard';

jest.mock('./EmailSignInForm', () => ({
  EmailSignInForm: () => <div data-testid="email-form" />,
}));

jest.mock('@/app/shared/components/Download', () => ({
  MobileStore: () => <div data-testid="store-badges" />,
}));

jest.mock('next-auth/react', () => ({ signIn: jest.fn() }));

describe('AuthCard', () => {
  it('opens on the one-tap options, which is what most readers use', () => {
    render(<AuthCard onLogin={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Create your free account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Google/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue with Apple/ })).toBeInTheDocument();
    expect(screen.queryByTestId('email-form')).not.toBeInTheDocument();
  });

  // A step on the same card, not a page away — whatever brought the reader here
  // is still behind it
  it('swaps to the email form in place', async () => {
    const user = userEvent.setup();
    render(<AuthCard onLogin={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Sign in with email' }));

    expect(screen.getByTestId('email-form')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Continue with Google/ })).not.toBeInTheDocument();
  });

  it('lets the reader back out to the other options', async () => {
    const user = userEvent.setup();
    render(<AuthCard onLogin={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Sign in with email' }));
    await user.click(screen.getByRole('button', { name: 'Back to all sign in options' }));

    expect(screen.getByRole('button', { name: /Continue with Google/ })).toBeInTheDocument();
  });

  it('carries the small print and the store badges either way', async () => {
    const user = userEvent.setup();
    render(<AuthCard onLogin={jest.fn()} />);

    expect(screen.getByText(/Terms of Use/)).toBeInTheDocument();
    expect(screen.getByTestId('store-badges')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sign in with email' }));

    expect(screen.getByText(/Terms of Use/)).toBeInTheDocument();
  });
});
