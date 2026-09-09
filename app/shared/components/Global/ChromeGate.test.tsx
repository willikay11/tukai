import React from 'react';

import { render, screen } from '@testing-library/react';

import { ChromeGate } from './ChromeGate';

let pathname = '/';
jest.mock('next/navigation', () => ({ usePathname: () => pathname }));

const renderGate = () =>
  render(
    <ChromeGate>
      <header>App chrome</header>
    </ChromeGate>,
  );

describe('ChromeGate', () => {
  it('shows the chrome on an ordinary page', () => {
    pathname = '/places/kraftory';

    renderGate();

    expect(screen.getByText('App chrome')).toBeInTheDocument();
  });

  // The auth screens draw their own bar over a full-bleed image; the app header
  // used to stack on top of it
  it.each(['/auth/sign-in', '/auth/sign-up', '/auth/interests', '/auth/otp-confirmation'])(
    'stands down on %s',
    (path) => {
      pathname = path;

      const { container } = renderGate();

      expect(container).toBeEmptyDOMElement();
    },
  );

  // A place whose name merely starts with the same letters is not an auth page
  it('does not mistake another route for one', () => {
    pathname = '/authors';

    renderGate();

    expect(screen.getByText('App chrome')).toBeInTheDocument();
  });
});
