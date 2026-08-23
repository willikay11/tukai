import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PillTabs } from './PillTabs';

const TABS = [
  { value: 'mine', label: 'Mine' },
  { value: 'all', label: 'All' },
];

describe('PillTabs', () => {
  it('renders every tab', () => {
    render(<PillTabs tabs={TABS} value="mine" onChange={jest.fn()} />);

    expect(screen.getByRole('tab', { name: 'Mine' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
  });

  it('marks the current one active', () => {
    render(<PillTabs tabs={TABS} value="all" onChange={jest.fn()} />);

    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('data-state', 'active');
    expect(screen.getByRole('tab', { name: 'Mine' })).toHaveAttribute('data-state', 'inactive');
  });

  it('reports the value when another is picked', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<PillTabs tabs={TABS} value="mine" onChange={onChange} />);

    await user.click(screen.getByRole('tab', { name: 'All' }));

    expect(onChange).toHaveBeenCalledWith('all');
  });

  // The raised-white-pill treatment is what makes this a segmented control
  // rather than the underlined default
  it('raises the active pill on a grey track', () => {
    render(<PillTabs tabs={TABS} value="mine" onChange={jest.fn()} />);

    expect(screen.getByRole('tablist')).toHaveClass('rounded-full', 'bg-gray-100');
    expect(screen.getByRole('tab', { name: 'Mine' }).className).toContain(
      'data-[state=active]:bg-white',
    );
  });

  it('copes with a single tab', () => {
    render(<PillTabs tabs={[TABS[0]]} value="mine" onChange={jest.fn()} />);

    expect(screen.getAllByRole('tab')).toHaveLength(1);
  });
});
