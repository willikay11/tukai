import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PricingModelPicker } from './index';

describe('PricingModelPicker', () => {
  it('asks the question above the pills', () => {
    render(<PricingModelPicker />);

    expect(screen.getByText('Is this a free or paid experience')).toBeInTheDocument();
  });

  it('opens on Paid Experience', () => {
    render(<PricingModelPicker />);

    // The gradient is how a chosen pill reads everywhere else in the flow
    expect(screen.getByRole('button', { name: 'Paid Experience' })).toHaveClass(
      'bg-gradient-to-b',
      'text-white',
    );
  });

  // Shown rather than hidden, so a host can see it is coming
  it('offers Free Experience locked, not missing', async () => {
    const user = userEvent.setup();
    render(<PricingModelPicker />);

    const free = screen.getByRole('button', { name: /Free Experience/ });

    expect(free).toBeDisabled();
    expect(free).toHaveClass('cursor-not-allowed');
    expect(free).not.toHaveClass('bg-gradient-to-b');

    await user.click(free);

    // Still on paid: clicking a locked pill changes nothing
    expect(screen.getByRole('button', { name: 'Paid Experience' })).toHaveClass('bg-gradient-to-b');
  });

  // Reading order: the label, then the lock that qualifies it
  it('puts the lock after the words it qualifies', () => {
    render(<PricingModelPicker />);

    const free = screen.getByRole('button', { name: /Free Experience/ });
    // The label is a bare text node, so it is the node order that says which
    // side the lock is on
    const nodes = Array.from(free.childNodes);

    const label = nodes.findIndex((node) => node.textContent?.includes('Free Experience'));
    const lock = nodes.findIndex((node) => (node as Element).tagName?.toLowerCase() === 'svg');

    expect(label).toBeGreaterThanOrEqual(0);
    expect(lock).toBeGreaterThan(label);
  });
});
