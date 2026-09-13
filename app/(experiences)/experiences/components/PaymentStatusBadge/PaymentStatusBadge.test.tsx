import { render, screen } from '@testing-library/react';

import { PaymentStatusBadge } from './index';

// The dot carries the colour; the label carries the text colour
const dotOf = (container: HTMLElement) => container.querySelector('span[class*="rounded-full"]');

describe('PaymentStatusBadge', () => {
  it('shows settled payments in the brand green', () => {
    const { container } = render(<PaymentStatusBadge status="completed" />);

    expect(screen.getByText('Paid')).toHaveClass('text-primary');
    expect(dotOf(container)).toHaveClass('bg-primary');
  });

  it('shows a failed payment in red', () => {
    const { container } = render(<PaymentStatusBadge status="failed" />);

    expect(screen.getByText('Failed')).toHaveClass('text-red-600');
    expect(dotOf(container)).toHaveClass('bg-red-500');
  });

  it('shows a pending payment in the warning colour', () => {
    const { container } = render(<PaymentStatusBadge status="pending" />);

    expect(screen.getByText('Pending')).toHaveClass('text-orange-600');
    expect(dotOf(container)).toHaveClass('bg-orange-500');
  });

  it('keeps inert states neutral', () => {
    render(<PaymentStatusBadge status="expired" />);
    expect(screen.getByText('Expired')).toHaveClass('text-gray-500');
  });

  it('falls back to a neutral badge for an unknown status', () => {
    render(<PaymentStatusBadge status="refunding" />);

    expect(screen.getByText('Refunding')).toHaveClass('text-gray-500');
  });

  it('lets a caller override the map', () => {
    render(
      <PaymentStatusBadge
        status="confirmed"
        config={{ confirmed: { label: 'Confirmed', dot: 'bg-primary', text: 'text-primary' } }}
      />,
    );

    expect(screen.getByText('Confirmed')).toBeInTheDocument();
  });
});
