import {
  CreatorPlanState,
  HostingPaymentMethod,
  HostingPlan,
  HostingPlanId,
  NO_HOSTING_PLAN,
} from '@/types/hostingPlan';

/**
 * Hosting plans - mocked.
 *
 * Every export here returns a Promise, as a real service would, so the
 * call sites in HostingPlanContext never change when a backend exists:
 * only the bodies below turn into `api.get`/`api.post` calls.
 */
const LATENCY_MS = 450;

const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));

const CATALOG: HostingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Start hosting experiences on Tukai.',
    priceAmount: 1,
    priceCurrency: 'USD',
    priceLabel: '$1 / month',
    commissionPct: 4,
    features: [
      'Up to 3 live experiences',
      'Paid & free ticketing',
      'Withdraw to Tukai Wallet',
      'Basic analytics',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Grow your experience business with advanced tools & visibility.',
    priceAmount: 15,
    priceCurrency: 'USD',
    priceLabel: '$15 / month',
    commissionPct: 3.5,
    features: [
      'Unlimited live experiences',
      'Recurring experiences',
      'Discount codes & coupons',
      'Featured creator badge',
    ],
    isMostPopular: true,
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For operators managing teams & high-volume bookings.',
    priceAmount: 49,
    priceCurrency: 'USD',
    priceLabel: '$49 / month',
    commissionPct: 3,
    features: [
      'Everything in Premium',
      '10+ team members',
      'Dedicated account support',
      'Lowest 3% ticket fee',
    ],
  },
];

const addMonths = (from: Date, months: number): string => {
  const next = new Date(from);
  next.setMonth(next.getMonth() + months);
  return next.toISOString();
};

export const fetchHostingPlans = (): Promise<HostingPlan[]> => delay(CATALOG);

export const getHostingPlan = (planId: HostingPlanId): HostingPlan | undefined =>
  CATALOG.find((plan) => plan.id === planId);

/** New subscription: takes effect now, renews in a month. */
export const subscribeToPlan = (
  planId: HostingPlanId,
  paymentMethod: HostingPaymentMethod,
): Promise<CreatorPlanState> => {
  const now = new Date();

  return delay<CreatorPlanState>({
    planId,
    status: 'active',
    paymentMethod,
    currentPeriodEnd: addMonths(now, 1),
    dateSubscribed: now.toISOString(),
  });
};

/** Plan change: effective immediately, the next renewal carries the new price. */
export const changePlan = (
  planId: HostingPlanId,
  current: CreatorPlanState,
): Promise<CreatorPlanState> =>
  delay<CreatorPlanState>({
    ...current,
    planId,
    status: 'active',
  });

/** Cancel: keeps working until the period already paid for ends. */
export const cancelPlan = (current: CreatorPlanState): Promise<CreatorPlanState> =>
  delay<CreatorPlanState>({ ...current, status: 'cancel_pending' });

/** Keep my plan: undoes a pending cancellation. */
export const resumePlan = (current: CreatorPlanState): Promise<CreatorPlanState> =>
  delay<CreatorPlanState>({ ...current, status: 'active' });

export const clearHostingPlan = (): Promise<CreatorPlanState> => delay(NO_HOSTING_PLAN);
