import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BillingDetailsForm } from './index';

const successResponse = {
  ok: true,
  json: async () => ({
    data: {
      paymentMethod: { id: 'pm-1' },
      verificationResponse: { authorizationUrl: 'https://checkout.paystack.com/abc123' },
    },
  }),
};

describe('BillingDetailsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue(successResponse) as jest.Mock;
  });

  const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByPlaceholderText('Town/City'), 'Nairobi');
    await user.type(screen.getByPlaceholderText('Postcode'), '00100');
  };

  it('disables Continue to payment until town and postcode are filled', async () => {
    const user = userEvent.setup();
    render(<BillingDetailsForm onSuccess={jest.fn()} />);

    const submit = screen.getByRole('button', { name: 'Continue to payment' });
    expect(submit).toBeDisabled();

    await fillForm(user);
    expect(submit).toBeEnabled();
  });

  it('submits the billing payload with country, town and postcode and fires callbacks', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const onSubmitStart = jest.fn();

    render(<BillingDetailsForm onSuccess={onSuccess} onSubmitStart={onSubmitStart} />);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Continue to payment' }));

    expect(onSubmitStart).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      '/auth/subscribe/api',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          type: 'billingDetails',
          paymentOption: 'card',
          countryCode: 'KE',
          townCity: 'Nairobi',
          postcode: '00100',
        }),
      }),
    );

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          verificationResponse: 'https://checkout.paystack.com/abc123',
        }),
      );
    });
  });

  it('fires onError and stays recoverable when the API fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Billing details creation failed' }),
    });

    const user = userEvent.setup();
    const onError = jest.fn();
    const onSuccess = jest.fn();

    render(<BillingDetailsForm onSuccess={onSuccess} onError={onError} />);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Continue to payment' }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith('Billing details creation failed');
    });
    expect(onSuccess).not.toHaveBeenCalled();
    // Form is still usable for a retry
    expect(screen.getByRole('button', { name: 'Continue to payment' })).toBeEnabled();
  });
});
