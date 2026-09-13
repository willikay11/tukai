import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Experience } from '@/types/experience';

import { MobileBookingBar } from './index';

jest.mock('@/app/(experiences)/experiences/components/BookingPanel', () => ({
  BookingPanel: ({ view }: { view: string }) => <div data-testid="booking-panel">{view}</div>,
}));

const experience = (extra: Record<string, unknown> = {}) =>
  ({
    id: 'e1',
    title: 'Karura Night Hike',
    currency: 'Ksh.',
    isPaid: true,
    priceStartsFrom: { amount: 2500, currency: 'Ksh.' },
    ...extra,
  }) as unknown as Experience;

describe('MobileBookingBar', () => {
  it('offers both actions, and no price', () => {
    render(<MobileBookingBar experience={experience()} />);

    expect(screen.getByRole('button', { name: 'Share Moment' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reserve' })).toBeInTheDocument();
    expect(screen.queryByText(/2,500/)).not.toBeInTheDocument();
  });

  // Each button lands on what it promised — not on a tab row to choose again
  it('opens the reservation view from Reserve', async () => {
    const user = userEvent.setup();
    render(<MobileBookingBar experience={experience()} />);

    expect(screen.queryByTestId('booking-panel')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reserve' }));

    expect(screen.getByTestId('booking-panel')).toHaveTextContent('reservation');
  });

  it('opens the moments view from Share Moment', async () => {
    const user = userEvent.setup();
    render(<MobileBookingBar experience={experience()} />);

    await user.click(screen.getByRole('button', { name: 'Share Moment' }));

    expect(screen.getByTestId('booking-panel')).toHaveTextContent('moments');
  });
});
