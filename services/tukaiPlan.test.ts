import { apiWithToken } from './apiService';
import {
  confirmTukaiSubscription,
  fetchTukaiAllowance,
  fetchTukaiPlan,
  fetchTukaiSubscription,
  startTukaiCheckout,
} from './tukaiPlan';

jest.mock('./apiService', () => ({ apiWithToken: jest.fn() }));

const api = { get: jest.fn(), post: jest.fn() };

describe('paying for TukAI (DEV-373)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiWithToken as jest.Mock).mockResolvedValue(api);
  });

  it('reads the TukAI plan and its price', async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 'plan-tukai',
            product: 'tukai',
            name: 'TukAI',
            price: { amount: '14.99', currency: 'USD' },
          },
        ],
      },
    });

    await expect(fetchTukaiPlan()).resolves.toEqual({
      id: 'plan-tukai',
      name: 'TukAI',
      priceAmount: 14.99,
      priceCurrency: 'USD',
      priceLabel: '$14.99',
    });
    expect(api.get).toHaveBeenCalledWith('/v1/subscriptions/plans/', {
      params: { product: 'tukai' },
    });
  });

  it('has no plan when the API lists none', async () => {
    api.get.mockResolvedValue({ data: { results: [] } });
    await expect(fetchTukaiPlan()).resolves.toBeNull();
  });

  // The hosting subscription is on the same list and must not unlock TukAI
  it('finds the live TukAI subscription, not the hosting one', async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          { id: 'sub-host', product: 'hosting', status: 'active' },
          { id: 'sub-old', product: 'tukai', status: 'completed' },
          {
            id: 'sub-ai',
            product: 'tukai',
            status: 'active',
            auto_renew: true,
            next_payment_date: '2026-12-18T00:00:00Z',
          },
        ],
      },
    });

    await expect(fetchTukaiSubscription()).resolves.toEqual({
      id: 'sub-ai',
      renewsAt: '2026-12-18T00:00:00Z',
      autoRenew: true,
    });
  });

  it('has no subscription when only a hosting one is live', async () => {
    api.get.mockResolvedValue({
      data: { results: [{ id: 'sub-host', product: 'hosting', status: 'active' }] },
    });
    await expect(fetchTukaiSubscription()).resolves.toBeNull();
  });

  it('starts the subscription and returns its Paystack checkout', async () => {
    api.post.mockResolvedValue({
      data: {
        order: { purchased_item: { type: 'subscription', id: 'sub-new' } },
        payment_details: { authorization_url: 'https://checkout.paystack.com/abc' },
      },
    });

    await expect(startTukaiCheckout('plan-tukai')).resolves.toEqual({
      subscriptionId: 'sub-new',
      authorizationUrl: 'https://checkout.paystack.com/abc',
    });
    expect(api.post).toHaveBeenCalledWith('/v1/subscriptions/', { plan: 'plan-tukai' });
  });

  it('reads the subscription back after payment, live or not yet', async () => {
    api.get.mockResolvedValueOnce({
      data: { id: 'sub-new', status: 'active', next_payment_date: '2026-12-18T00:00:00Z' },
    });
    await expect(confirmTukaiSubscription('sub-new')).resolves.toMatchObject({ id: 'sub-new' });

    api.get.mockResolvedValueOnce({ data: { id: 'sub-new', status: 'cancelled' } });
    await expect(confirmTukaiSubscription('sub-new')).resolves.toBeNull();
  });

  // DEV-374: this month's free messages, from the server
  it('reads the free allowance', async () => {
    api.get.mockResolvedValue({
      data: {
        unlimited: false,
        limit: 20,
        used: 2,
        remaining: 18,
        resets_at: '2026-12-01T00:00:00Z',
      },
    });

    await expect(fetchTukaiAllowance()).resolves.toEqual({
      unlimited: false,
      limit: 20,
      used: 2,
      remaining: 18,
      resetsAt: '2026-12-01T00:00:00Z',
    });
    expect(api.get).toHaveBeenCalledWith('/v1/tukai/allowance/');
  });
});
