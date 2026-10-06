import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PlaceDescription } from './PlaceDescription';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

/**
 * jsdom lays nothing out, so every element reports a height of 0 and nothing
 * looks clipped. Clipping is simulated by giving the text more content height
 * than its box.
 */
const withClipping = (clipped: boolean) => {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => (clipped ? 90 : 60),
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => 60,
  });
};

describe('PlaceDescription', () => {
  afterEach(() => withClipping(false));

  it('clamps the text to three lines', () => {
    withClipping(false);
    render(<PlaceDescription text="Two hundred women shaping clay beads by hand." />);

    expect(screen.getByText('Two hundred women shaping clay beads by hand.')).toHaveClass(
      'line-clamp-3'
    );
  });

  it('has no toggle when the text fits in three lines', () => {
    withClipping(false);
    render(<PlaceDescription text="A short line." />);

    expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument();
  });

  it('shows Show more when the clamp cuts the text', () => {
    withClipping(true);
    render(<PlaceDescription text="A long description that runs past three lines." />);

    expect(screen.getByRole('button', { name: 'Show more' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('expands on Show more and collapses again on Show less', () => {
    withClipping(true);
    render(<PlaceDescription text="A long description that runs past three lines." />);

    fireEvent.click(screen.getByRole('button', { name: 'Show more' }));

    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Show less' }));

    expect(screen.getByRole('button', { name: 'Show more' })).toBeInTheDocument();
  });

  it('shows the description as plain text when collapsed, without its markup', () => {
    withClipping(false);
    render(<PlaceDescription text="<p>Clay <strong>beads</strong></p>" />);

    expect(screen.getByText('Clay beads')).toBeInTheDocument();
  });
});
