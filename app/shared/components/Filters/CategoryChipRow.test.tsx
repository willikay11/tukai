import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { type CategoryChip, CategoryChipRow } from './CategoryChipRow';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const chips: CategoryChip[] = [
  { value: 'all', label: 'All' },
  { value: 'arts', label: 'Arts' },
  { value: 'food', label: 'Food' },
];

/**
 * jsdom lays nothing out, so the row reads as having nothing to scroll unless
 * the geometry is faked. Overflow is simulated by a scroll width larger than
 * the visible width.
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

describe('CategoryChipRow', () => {
  afterEach(resetGeometry);

  it('renders one chip per category and marks the selected one', () => {
    render(<CategoryChipRow chips={chips} value="arts" onChange={jest.fn()} />);

    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tab', { name: 'Arts' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'false');
  });

  it('reports the chip that was picked', () => {
    const onChange = jest.fn();
    render(<CategoryChipRow chips={chips} value="all" onChange={onChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Food' }));

    expect(onChange).toHaveBeenCalledWith('food');
  });

  it('shows no arrows when the chips fit', () => {
    render(<CategoryChipRow chips={chips} value="all" onChange={jest.fn()} />);

    expect(
      screen.queryByRole('button', { name: 'Scroll categories left' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Scroll categories right' }),
    ).not.toBeInTheDocument();
  });

  it('shows only the forward arrow at the start of an overflowing row', () => {
    withOverflow();
    render(<CategoryChipRow chips={chips} value="all" onChange={jest.fn()} />);

    expect(
      screen.queryByRole('button', { name: 'Scroll categories left' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scroll categories right' })).toBeInTheDocument();
  });
});
