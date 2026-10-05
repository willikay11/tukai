import React from 'react';

import { render, screen } from '@testing-library/react';

import { CardRail } from './CardRail';

jest.mock('next/link', () => {
  function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

/**
 * jsdom lays nothing out, so every element reports a scrollWidth and a
 * clientWidth of 0 — which is exactly the "nothing to scroll" case the rail
 * reports as being at both ends at once. Overflow is simulated by giving the
 * scroll container a width smaller than its contents.
 */
const withOverflow = () => {
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get: () => 1000,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => 400,
  });
};

const resetGeometry = () => {
  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get: () => 0,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => 0,
  });
};

describe('CardRail', () => {
  afterEach(resetGeometry);

  it('carries the heading and the line under it', () => {
    render(
      <CardRail title="Promoted places" subtitle="Handpicked by the communities">
        <div>a card</div>
      </CardRail>,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Promoted places');
    expect(screen.getByText('Handpicked by the communities')).toBeInTheDocument();
  });

  // Arrows that could never do anything are noise
  it('shows no arrows when every card already fits', () => {
    resetGeometry();

    render(
      <CardRail title="Promoted places">
        <div>a card</div>
      </CardRail>,
    );

    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  it('shows them once the rail overflows', () => {
    withOverflow();

    render(
      <CardRail title="Promoted places">
        <div>a card</div>
      </CardRail>,
    );

    expect(screen.getByRole('button', { name: /previous promoted places/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next promoted places/i })).toBeInTheDocument();
  });

  // The See all link takes the space back where the section has somewhere to go
  it('shows See all in place of the arrows when nothing scrolls', () => {
    resetGeometry();

    render(
      <CardRail title="Guided tours" seeAllHref="/experiences">
        <div>a card</div>
      </CardRail>,
    );

    expect(screen.getByText('See all')).toHaveAttribute('href', '/experiences');
  });

  it('leaves See all out when the caller has nowhere to send the reader', () => {
    resetGeometry();

    render(
      <CardRail title="Guided tours">
        <div>a card</div>
      </CardRail>,
    );

    expect(screen.queryByText('See all')).not.toBeInTheDocument();
  });

  // Some sections would rather send the reader on than page in place
  describe('showArrows={false}', () => {
    it('keeps See all and draws no arrows, even when the rail overflows', () => {
      withOverflow();

      render(
        <CardRail title="Recent moments" seeAllHref="/moments" showArrows={false}>
          <div>a card</div>
        </CardRail>,
      );

      expect(screen.getByText('See all')).toHaveAttribute('href', '/moments');
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    });
  });
});
