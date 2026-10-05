import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { MomentComposeCard } from './MomentComposeCard';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

describe('MomentComposeCard', () => {
  it('invites the reader to post one', () => {
    render(<MomentComposeCard onClick={jest.fn()} />);

    expect(screen.getByText('Been somewhere good?')).toBeInTheDocument();
    expect(
      screen.getByText('Share a moment and tag the place, experience or community.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('Camera01Icon')).toBeInTheDocument();
  });

  it('opens the composer when pressed', () => {
    const onClick = jest.fn();
    render(<MomentComposeCard onClick={onClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });

  // It matches the height of the cards' photos, not the whole card, so it does
  // not stretch past them to sit under the bylines
  it('is the same shape as a moment photo, and aligns to the top', () => {
    render(<MomentComposeCard onClick={jest.fn()} />);

    const tile = screen.getByRole('button');
    expect(tile).toHaveClass('aspect-[3/4]');
    expect(tile).toHaveClass('self-start');
    expect(tile).toHaveClass('w-[265px]');
  });
});
