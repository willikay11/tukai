import React from 'react';

import { render, screen } from '@testing-library/react';

import CommunitiesPage from './page';

jest.mock('./components/CommunitiesPageContent', () => ({
  CommunitiesPageContent: () => <div data-testid="communities" />,
}));

// Whatever this renders, it must not be the sign-in dialog
jest.mock('./[communityId]/components/authGuard', () => ({
  AuthGuard: () => <div data-testid="auth-guard" />,
}));

describe('CommunitiesPage', () => {
  /**
   * Arriving signed out used to open the sign-in dialog before the reader had
   * seen anything. The page says who it is for instead, and asks for a sign-in
   * only on the tab that needs one.
   */
  it('shows the page rather than a sign-in dialog', () => {
    render(<CommunitiesPage />);

    expect(screen.getByTestId('communities')).toBeInTheDocument();
    expect(screen.queryByTestId('auth-guard')).not.toBeInTheDocument();
  });
});
