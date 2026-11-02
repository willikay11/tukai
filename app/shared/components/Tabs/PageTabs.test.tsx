import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PageTabs } from './PageTabs';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ variant }: { variant: string }) => <span data-testid={`icon-${variant}`} />,
}));

const TABS = [
  { value: 'a', label: 'Discover', icon: 'CompassIcon' },
  { value: 'b', label: 'Following', icon: 'X', badge: { count: 1, label: '1 invite waiting' } },
  { value: 'c', label: 'Mine', icon: 'Y' },
];

const renderTabs = (value = 'a', onChange = jest.fn()) => {
  render(<PageTabs tabs={TABS} value={value} onChange={onChange} ariaLabel="Lists" idPrefix="t" />);
  return onChange;
};

describe('PageTabs', () => {
  it('marks the selected tab and points it at its panel', () => {
    renderTabs('b');

    const tab = screen.getByRole('tab', { name: /Following/ });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(tab).toHaveAttribute('aria-controls', 't-panel-b');
    expect(tab).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Discover' })).toHaveAttribute('tabindex', '-1');
  });

  it('shows a badge with its own label', () => {
    renderTabs();

    expect(screen.getByLabelText('1 invite waiting')).toHaveTextContent('1');
  });

  it('moves with the arrow keys, wrapping at the ends', async () => {
    const onChange = renderTabs('a');

    screen.getByRole('tab', { name: 'Discover' }).focus();
    await userEvent.keyboard('{ArrowLeft}');

    expect(onChange).toHaveBeenCalledWith('c');
  });

  it('jumps to the last tab on End', async () => {
    const onChange = renderTabs('a');

    screen.getByRole('tab', { name: 'Discover' }).focus();
    await userEvent.keyboard('{End}');

    expect(onChange).toHaveBeenCalledWith('c');
  });
});
