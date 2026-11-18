import { apiWithToken } from './apiService';
import {
  BackendPlan,
  PLATFORM_COMMISSION_PCT,
  cancelHostingSubscription,
  changeHostingPlan,
  fetchCurrentHostingSubscription,
  fetchHostingPlans,
  getDefaultPlan,
  termFeatures,
  toHostingPlan,
} from './hostingPlans';

jest.mock('./apiService', () => ({ apiWithToken: jest.fn() }));

const api = { get: jest.fn(), post: jest.fn() };

// GET /v1/subscriptions/plans/?product=hosting, as the API sends it
const apiPlan = (overrides: Record<string, unknown>) => ({
  id: 'plan-basic',
  product: 'hosting',
  name: 'Basic',
  description: '',
  price: { amount: '1.00', currency: 'USD' },
  is_default: true,
  commission_percentage: '8.00',
  max_live_experiences: 3,
  allows_recurring_experiences: false,
  allows_discount_codes: false,
  ...overrides,
});

describe('hosting plans from the API (DEV-458)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiWithToken as jest.Mock).mockResolvedValue(api);
  });

  it('reads the price, fee and limits off the plan', () => {
    const plan = toHostingPlan({
      id: 'plan-premium',
      name: 'Premium',
      price: { amount: '15.00', currency: 'USD' },
      commissionPercentage: '3.50',
      maxLiveExperiences: null,
      allowsRecurringExperiences: true,
      allowsDiscountCodes: true,
    } as BackendPlan);

    expect(plan).toMatchObject({
      id: 'plan-premium',
      backendId: 'plan-premium',
      priceAmount: 15,
      priceLabel: '$15 / month',
      commissionPct: 3.5,
      isMostPopular: true,
    });
    // The limit lines come from the terms; the badge line is marketing copy
    expect(plan.features).toEqual([
      'Unlimited live experiences',
      'Recurring experiences',
      'Discount codes & coupons',
      'Featured creator badge',
    ]);
  });

  it('charges the platform default when a plan sets no fee', () => {
    expect(
      toHostingPlan({ id: 'p', name: 'Starter', price: '0', commissionPercentage: null })
        .commissionPct,
    ).toBe(PLATFORM_COMMISSION_PCT);
  });

  it('writes the live limit in words', () => {
    expect(termFeatures({ maxLiveExperiences: 1 })).toEqual(['Up to 1 live experience']);
    expect(termFeatures({ maxLiveExperiences: 3 })).toEqual(['Up to 3 live experiences']);
  });

  it('lists hosting plans cheapest first and finds the default', async () => {
    api.get.mockResolvedValue({
      data: {
        results: [
          apiPlan({
            id: 'plan-business',
            name: 'Business',
            price: { amount: '49.00', currency: 'USD' },
            is_default: false,
          }),
          apiPlan({}),
          apiPlan({
            id: 'plan-premium',
            name: 'Premium',
            price: { amount: '15.00', currency: 'USD' },
            is_default: false,
          }),
        ],
      },
    });

    const plans = await fetchHostingPlans();

    expect(api.get).toHaveBeenCalledWith('/v1/subscriptions/plans/', {
      params: { product: 'hosting' },
    });
    expect(plans.map((plan) => plan.name)).toEqual(['Basic', 'Premium', 'Business']);
    expect(getDefaultPlan()?.id).toBe('plan-basic');
  });

  // "Show a plan as disabled only if it's missing from the response" (DEV-451)
  it('keeps a known plan the API did not return, with nothing to subscribe to', async () => {
    api.get.mockResolvedValue({ data: { results: [apiPlan({})] } });

    const plans = await fetchHostingPlans();
    const premium = plans.find((plan) => plan.name === 'Premium');

    expect(premium).toBeDefined();
    expect(premium?.backendId).toBeUndefined();
  });

  // The TukAI plan subscription sits on the same list
  it('reads the hosting subscription, not the TukAI one', async () => {
    api.get.mockResolvedValueOnce({ data: { results: [apiPlan({})] } });
    await fetchHostingPlans();

    api.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 'sub-ai',
            plan: 'plan-tukai',
            product: 'tukai',
            status: 'active',
            auto_renew: true,
          },
          {
            id: 'sub-host',
            plan: 'plan-basic',
            product: 'hosting',
            status: 'active',
            auto_renew: true,
            next_payment_date: '2026-12-18T00:00:00Z',
          },
        ],
      },
    });

    await expect(fetchCurrentHostingSubscription()).resolves.toMatchObject({
      planId: 'plan-basic',
      status: 'active',
      subscriptionId: 'sub-host',
    });
  });

  it('has no subscription to report once it has ended', async () => {
    api.get.mockResolvedValueOnce({ data: { results: [apiPlan({})] } });
    await fetchHostingPlans();
    api.get.mockResolvedValueOnce({
      data: {
        results: [{ id: 'sub-old', plan: 'plan-basic', product: 'hosting', status: 'completed' }],
      },
    });

    await expect(fetchCurrentHostingSubscription()).resolves.toBeNull();
  });

  // DEV-400: one call, and the current plan runs until the new one is paid
  it('switches plan in one step and returns where to pay', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        results: [apiPlan({}), apiPlan({ id: 'plan-premium', name: 'Premium', is_default: false })],
      },
    });
    await fetchHostingPlans();
    api.post.mockResolvedValue({
      data: {
        order: { purchased_item: { type: 'subscription', id: 'sub-new' } },
        payment_details: { authorization_url: 'https://checkout.paystack.com/x' },
      },
    });

    await expect(changeHostingPlan('sub-old', 'plan-premium')).resolves.toEqual({
      subscriptionId: 'sub-new',
      authorizationUrl: 'https://checkout.paystack.com/x',
    });
    expect(api.post).toHaveBeenCalledWith('/v1/subscriptions/sub-old/change-plan/', {
      plan: 'plan-premium',
    });
  });

  // The cancel endpoint answers 204 with no body
  it('reads a cancelled plan back: it runs to the end of the period', async () => {
    api.get.mockResolvedValueOnce({ data: { results: [apiPlan({})] } });
    await fetchHostingPlans();
    api.post.mockResolvedValue({ status: 204, data: '' });
    api.get.mockResolvedValueOnce({
      data: {
        id: 'sub-host',
        plan: 'plan-basic',
        product: 'hosting',
        status: 'active',
        auto_renew: false,
        end_date: '2026-12-18T00:00:00Z',
      },
    });

    await expect(cancelHostingSubscription('sub-host')).resolves.toMatchObject({
      planId: 'plan-basic',
      status: 'cancel_pending',
      currentPeriodEnd: '2026-12-18T00:00:00Z',
    });
    expect(api.post).toHaveBeenCalledWith('/v1/subscriptions/sub-host/cancel/', {});
  });
});
