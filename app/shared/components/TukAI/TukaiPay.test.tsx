import { fireEvent, render, screen } from '@testing-library/react';

import { TukaiPay } from './TukaiPay';

const onPaymentResult = jest.fn();
const retryCheckout = jest.fn();
let mockState: Record<string, unknown> = {};

jest.mock('@/context/TukaiContext', () => ({
  useTukai: () => ({
    priceLabel: '$14.99',
    checkoutUrl: null,
    isStartingCheckout: false,
    isConfirmingPayment: false,
    payError: null,
    onPaymentResult,
    retryCheckout,
    ...mockState,
  }),
}));
jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));
// Paystack's checkout frame: reports the payment through onPaymentSuccess
jest.mock('@/components/ui/paystack', () => ({
  Paystack: ({
    url,
    onPaymentSuccess,
  }: {
    url: string;
    onPaymentSuccess: (ok: boolean) => void;
  }) => (
    <button type="button" data-url={url} onClick={() => onPaymentSuccess(true)}>
      Paystack checkout frame
    </button>
  ),
}));

describe('TukaiPay (DEV-373)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = {};
  });

  it('shows the plan price, and no sample card or M-Pesa form', () => {
    mockState = { checkoutUrl: 'https://checkout.paystack.com/abc' };
    render(<TukaiPay />);

    expect(screen.getByText('$14.99')).toBeInTheDocument();
    expect(screen.queryByText(/Visa ending 4242/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText('M-Pesa number')).not.toBeInTheDocument();
  });

  it('opens Paystack’s checkout and passes its answer on', () => {
    mockState = { checkoutUrl: 'https://checkout.paystack.com/abc' };
    render(<TukaiPay />);

    const frame = screen.getByRole('button', { name: 'Paystack checkout frame' });
    expect(frame).toHaveAttribute('data-url', 'https://checkout.paystack.com/abc');

    fireEvent.click(frame);
    expect(onPaymentResult).toHaveBeenCalledWith(true);
  });

  it('says it is opening the payment while the checkout starts', () => {
    mockState = { isStartingCheckout: true };
    render(<TukaiPay />);

    expect(screen.getByRole('status')).toHaveTextContent('Opening the payment');
  });

  it('says it is confirming once Paystack reports a payment', () => {
    mockState = { checkoutUrl: 'https://checkout.paystack.com/abc', isConfirmingPayment: true };
    render(<TukaiPay />);

    expect(screen.getByRole('status')).toHaveTextContent('Confirming your payment');
    expect(
      screen.queryByRole('button', { name: 'Paystack checkout frame' }),
    ).not.toBeInTheDocument();
  });

  it('explains a failed payment and offers to try again', () => {
    mockState = { payError: "The payment didn't go through, and nothing was charged." };
    render(<TukaiPay />);

    expect(screen.getByRole('alert')).toHaveTextContent("didn't go through");
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retryCheckout).toHaveBeenCalled();
  });
});
