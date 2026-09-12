import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FilterPill } from './FilterPill';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

describe('FilterPill', () => {
  it('shows its label and icon', () => {
    render(<FilterPill label="Restaurants" icon="BbqGrillIcon" onClick={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Restaurants' })).toBeInTheDocument();
    expect(screen.getByTestId('BbqGrillIcon')).toBeInTheDocument();
  });

  it('works without an icon', () => {
    render(<FilterPill label="All" onClick={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
  });

  /**
   * The light green shared with the category bar over Explore and Discover.
   * These two rows were separate implementations of the same chip, which is
   * how they ended up on different greens.
   */
  it('takes the light green when it is the chosen filter', () => {
    render(<FilterPill label="Restaurants" onClick={jest.fn()} isSelected />);

    expect(screen.getByRole('button')).toHaveClass('bg-green-100', 'text-primary');
  });

  it('sits grey when it is not', () => {
    render(<FilterPill label="Restaurants" onClick={jest.fn()} />);

    expect(screen.getByRole('button')).toHaveClass('bg-gray-100', 'text-gray-500');
  });

  // The selected state is what the chip means, so it is announced, not just drawn
  it('tells a screen reader whether it is on', () => {
    const { rerender } = render(<FilterPill label="Restaurants" onClick={jest.fn()} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');

    rerender(<FilterPill label="Restaurants" onClick={jest.fn()} isSelected />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('reports a press', async () => {
    const onClick = jest.fn();
    const user = userEvent.setup();
    render(<FilterPill label="Restaurants" onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });
});
