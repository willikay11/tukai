import { apiWithToken } from '@/services/apiService';
import { moneyAmount } from '@/utils/money';
import { parseApiError } from '@/utils/parseApiError';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

/**
 * Paying for TukAI (DEV-373). It's a subscription plan like the hosting
 * ones, with `product: "tukai"`: subscribing goes through POST /subscriptions/
 * and a Paystack checkout, and a live TukAI subscription makes TukAI
 * unlimited. Holding one doesn't touch the host's hosting plan.
 */

export type TukaiPlan = {
  id: string;
  name: string;
  priceAmount: number;
  priceCurrency: string;
  /** "$14.99" */
  priceLabel: string;
};

export type TukaiSubscription = {
  id: string;
  /** When it next renews, or when it ends if renewal is off */
  renewsAt: string | null;
  autoRenew: boolean;
};

export type TukaiCheckout = {
  subscriptionId: string;
  authorizationUrl: string | null;
};

type BackendSubscription = {
  id: string;
  product?: string;
  status: string;
  autoRenew?: boolean;
  nextPaymentDate?: string | null;
  endDate?: string | null;
};

/** "$14.99", "KES 1,500" */
const formatPrice = (amount: number, currency: string): string => {
  const figure = amount.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return currency === 'USD' ? `$${figure}` : `${currency} ${figure}`;
};

const isLive = (sub: BackendSubscription) => sub.status === 'active' || sub.status === 'pending';

const toTukaiSubscription = (sub: BackendSubscription): TukaiSubscription => ({
  id: sub.id,
  renewsAt: sub.nextPaymentDate ?? sub.endDate ?? null,
  autoRenew: sub.autoRenew !== false,
});

/** The TukAI plan and its price, or null when the API has none. */
export const fetchTukaiPlan = async (): Promise<TukaiPlan | null> => {
  const api = await apiWithToken();
  const response = await api.get('/v1/subscriptions/plans/', { params: { product: 'tukai' } });
  const payload = parseSnakeToCamel(response.data);
  const plans = (Array.isArray(payload) ? payload : (payload?.results ?? [])) as {
    id: string;
    name: string;
    product?: string;
    price: { amount: string; currency: string } | string;
  }[];
  const plan = plans.find((candidate) => !candidate.product || candidate.product === 'tukai');
  if (!plan) return null;

  const amount = moneyAmount(plan.price) ?? 0;
  const currency = (typeof plan.price === 'object' && plan.price?.currency) || 'USD';
  return {
    id: plan.id,
    name: plan.name,
    priceAmount: amount,
    priceCurrency: currency,
    priceLabel: formatPrice(amount, currency),
  };
};

/** The account's live TukAI subscription, or null. */
export const fetchTukaiSubscription = async (): Promise<TukaiSubscription | null> => {
  const api = await apiWithToken();
  const response = await api.get('/v1/subscriptions/');
  const payload = parseSnakeToCamel(response.data);
  const subscriptions = (Array.isArray(payload) ? payload : (payload?.results ?? [])) as
    | BackendSubscription[]
    | [];
  const live = subscriptions.find((sub) => sub.product === 'tukai' && isLive(sub));
  return live ? toTukaiSubscription(live) : null;
};

/** Starts a TukAI subscription and returns where to pay for it on Paystack. */
export const startTukaiCheckout = async (planId: string): Promise<TukaiCheckout> => {
  try {
    const api = await apiWithToken();
    const response = await api.post('/v1/subscriptions/', { plan: planId });
    const data = parseSnakeToCamel(response.data) as any;
    const purchasedItem = data?.order?.purchasedItem;
    return {
      subscriptionId: purchasedItem?.type === 'subscription' ? purchasedItem.id : '',
      authorizationUrl: data?.paymentDetails?.authorizationUrl ?? null,
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'Could not start the payment.'));
  }
};

/**
 * Reads the subscription back once Paystack reports a payment. Null when
 * it isn't live yet.
 */
export const confirmTukaiSubscription = async (
  subscriptionId: string,
): Promise<TukaiSubscription | null> => {
  const api = await apiWithToken();
  const response = await api.get(`/v1/subscriptions/${subscriptionId}/`);
  const sub = parseSnakeToCamel(response.data) as BackendSubscription;
  return isLive(sub) ? toTukaiSubscription(sub) : null;
};

/**
 * This month's free TukAI messages (DEV-374): every message to TukAI, and
 * every review draft, uses one. A live TukAI subscription makes it
 * unlimited. Resets at the start of each calendar month.
 */
export type TukaiAllowance = {
  unlimited: boolean;
  /** Null when unlimited */
  limit: number | null;
  used: number;
  /** Null when unlimited */
  remaining: number | null;
  resetsAt: string;
};

export const fetchTukaiAllowance = async (): Promise<TukaiAllowance> => {
  const api = await apiWithToken();
  const response = await api.get('/v1/tukai/allowance/');
  return parseSnakeToCamel(response.data) as TukaiAllowance;
};
