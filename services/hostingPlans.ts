import { apiWithToken } from '@/services/apiService';
import { CreatorPlanState, HostingPlan, HostingPlanId, HostingPlanStatus } from '@/types/hostingPlan';
import { parseApiError } from '@/utils/parseApiError';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

/**
 * Hosting plans.
 *
 * There is no creator-tier-specific API - this calls the same generic
 * `/v1/subscriptions/` endpoints the unrelated "Tukai Premium" subscription
 * uses. The backend only knows a plan's id/name/price, so the catalog below
 * (tagline, features, icon) stays a local, static presentation layer:
 * fetchHostingPlans() matches real plans to it by name and attaches
 * `backendId`, the UUID subscribing actually sends.
 *
 * Today the backend has exactly one real plan ("Monthly"), none of them
 * named Basic/Premium/Business - so none of the catalog below currently
 * get a `backendId` and are shown disabled, while whatever the backend
 * actually has is synthesized straight from its own name/description/price
 * and shown above the catalog, since it's the only one really
 * subscribable. Once the backend adds plans named to match the catalog,
 * they take over those entries (full copy, icon, features) automatically
 * and stop being synthesized.
 */
const CATALOG: HostingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Start hosting experiences on Tukai.',
    priceAmount: 1,
    priceCurrency: 'USD',
    priceLabel: '$1 / month',
    commissionPct: 8,
    icon: 'Plant02Icon',
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
    icon: 'Rocket01Icon',
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
    icon: 'Building03Icon',
    features: [
      'Everything in Premium',
      '10+ team members',
      'Dedicated account support',
      'Lowest 3% ticket fee',
    ],
    aiFeatures: [
      { icon: 'QuillWrite02Icon', text: 'Writes experience pages and day-by-day itineraries' },
      { icon: 'ChartIncreaseIcon', text: 'Suggests prices and dates from your past bookings' },
      { icon: 'BubbleChatIcon', text: 'Drafts replies to guest questions for your team' },
      { icon: 'AnalyticsUpIcon', text: 'Weekly summary of sales, guests and reviews' },
    ],
  },
];

type BackendPlan = { id: string; name: string; description: string; price: string };

type BackendSubscription = {
  id: string;
  plan: string;
  dateSubscribed: string | null;
  startDate: string | null;
  endDate: string | null;
  autoRenew: boolean;
  nextPaymentDate: string | null;
  status: 'pending' | 'active' | 'cancelled' | 'completed';
};

// Seeded with the static catalog so getHostingPlan() has names/icons/taglines
// to show even before fetchHostingPlans() resolves; backendId fills in once it does.
let planCache: HostingPlan[] = CATALOG;

export const getHostingPlan = (planId: HostingPlanId): HostingPlan | undefined =>
  planCache.find((plan) => plan.id === planId);

const findPlanByBackendId = (backendId: string): HostingPlan | undefined =>
  planCache.find((plan) => plan.backendId === backendId);

/**
 * Shown price for a plan this catalog has no name match for, keyed by the
 * backend's own plan name (lowercased) - a display override, not what
 * Paystack actually charges. ⚠️ The "Monthly" plan's real price on the
 * backend is whatever its Plan record says, which may not be $1 - if it
 * isn't, a subscriber sees "$1 / month" here and a different amount on
 * Paystack's own checkout page. Safe only as long as that record really is
 * priced at $1; fix the mismatch on the backend, not here, if it's not.
 */
const DISPLAY_PRICE_OVERRIDE: Record<string, number> = {
  monthly: 1,
};

/**
 * Builds a real, subscribable plan straight from the backend's own fields,
 * for a plan the static catalog has nothing named to match it to. No
 * currency field exists on the generic Plan model - USD is assumed, same
 * as every catalog entry; confirm with backend if that ever changes.
 */
const synthesizeHostingPlan = (backendPlan: BackendPlan): HostingPlan => {
  const override = DISPLAY_PRICE_OVERRIDE[backendPlan.name.toLowerCase()];
  const amount = override ?? (Number.parseFloat(backendPlan.price) || 0);
  const amountLabel = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

  return {
    id: backendPlan.id,
    name: backendPlan.name,
    tagline: backendPlan.description || `Tukai's ${backendPlan.name} plan.`,
    priceAmount: amount,
    priceCurrency: 'USD',
    priceLabel: `$${amountLabel} / month`,
    icon: 'Calendar03Icon',
    features: [],
    backendId: backendPlan.id,
  };
};

export const fetchHostingPlans = async (): Promise<HostingPlan[]> => {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/subscriptions/plans/');
    // Paginated like every other list endpoint here - not a bare array.
    const backendPlans = (parseSnakeToCamel(response.data)?.results ?? []) as BackendPlan[];

    const matchedCatalog = CATALOG.map((plan) => {
      const match = backendPlans.find(
        (backendPlan) => backendPlan.name.toLowerCase() === plan.name.toLowerCase(),
      );
      return match ? { ...plan, backendId: match.id } : plan;
    });

    // Whatever's left is real, but has no catalog entry to fill in yet -
    // synthesized and shown first, since it's the only one actually
    // subscribable right now.
    const matchedNames = new Set(
      matchedCatalog.filter((plan) => plan.backendId).map((plan) => plan.name.toLowerCase()),
    );
    const unlistedBackendPlans = backendPlans.filter(
      (backendPlan) => !matchedNames.has(backendPlan.name.toLowerCase()),
    );

    planCache = [...unlistedBackendPlans.map(synthesizeHostingPlan), ...matchedCatalog];

    const stillDisabled = matchedCatalog.filter((plan) => !plan.backendId);
    if (stillDisabled.length > 0) {
      console.info(
        '[hostingPlans] Shown disabled - no backend plan named these yet:',
        stillDisabled.map((plan) => plan.name),
      );
    }
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    // Keep the static catalog for display even on failure - every entry
    // shows disabled, same as a real "no plan named this yet" result,
    // rather than this screen itself breaking.
    planCache = CATALOG;
  }

  return planCache;
};

/**
 * `cancel_renewal` isn't surfaced as its own field in the read serializer -
 * a cancelled-but-not-yet-ended subscription is still `status: 'active'`
 * with `autoRenew: false` per the cancel endpoint's own description.
 * `pending` (created, not yet paid) maps to 'active' too: the only caller
 * that reads a 'pending' subscription is the post-checkout confirmation
 * step, reached only after Paystack itself already reported success.
 */
const toHostingPlanStatus = (sub: BackendSubscription): HostingPlanStatus => {
  if (sub.status === 'active' || sub.status === 'pending') {
    return sub.autoRenew ? 'active' : 'cancel_pending';
  }
  return 'none';
};

const toCreatorPlanState = (sub: BackendSubscription): CreatorPlanState => {
  const plan = findPlanByBackendId(sub.plan);

  if (!plan) {
    // A real subscription the backend doesn't recognise against our
    // catalog (e.g. plans fetch failed) - safer to show no plan than to
    // guess which one it is.
    return {
      planId: null,
      status: 'none',
      currentPeriodEnd: null,
      dateSubscribed: null,
      subscriptionId: sub.id,
    };
  }

  return {
    planId: plan.id,
    status: toHostingPlanStatus(sub),
    currentPeriodEnd: sub.nextPaymentDate ?? sub.endDate,
    dateSubscribed: sub.dateSubscribed ?? sub.startDate,
    subscriptionId: sub.id,
  };
};

/**
 * The signed-in account's current hosting plan, if any - called on
 * HostingPlanProvider mount to replace what localStorage used to seed.
 * Lists every subscription on the account (hosting and the unrelated Tukai
 * Premium one alike) and keeps only the one whose plan matches our hosting
 * catalog; an account can only hold one of those at a time.
 */
export const fetchCurrentHostingSubscription = async (): Promise<CreatorPlanState | null> => {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/subscriptions/');
    const subscriptions = (parseSnakeToCamel(response.data)?.results ??
      []) as BackendSubscription[];

    const hostingSubscription = subscriptions.find((sub) => findPlanByBackendId(sub.plan));
    return hostingSubscription ? toCreatorPlanState(hostingSubscription) : null;
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    return null;
  }
};

export type HostingCheckout = {
  subscriptionId: string;
  /** Null when the backend considered this free to activate outright - not
   * expected for any current hosting plan, but handled the same way
   * BookingPanel treats a ticket purchase with no authorization_url. */
  authorizationUrl: string | null;
};

/**
 * Starts a new subscription. Takes effect once Paystack's payment is
 * verified (by the backend's own webhook) - this call only creates the
 * pending subscription and returns where to send the creator to pay.
 */
export const startHostingCheckout = async (planId: HostingPlanId): Promise<HostingCheckout> => {
  const plan = getHostingPlan(planId);
  if (!plan?.backendId) {
    throw new Error(`${plan?.name ?? 'This plan'} isn't available to subscribe to right now.`);
  }

  try {
    const api = await apiWithToken();
    const response = await api.post('/v1/subscriptions/', { plan: plan.backendId });
    const data = parseSnakeToCamel(response.data);
    const purchasedItem = data?.order?.purchasedItem;

    return {
      subscriptionId: purchasedItem?.type === 'subscription' ? purchasedItem.id : '',
      authorizationUrl: data?.paymentDetails?.authorizationUrl ?? null,
    };
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'Could not start your subscription.'));
  }
};

/**
 * Reads back a subscription's real state - called once Paystack reports a
 * successful payment, since this call's own response is only the
 * just-created, not-yet-paid record.
 */
export const confirmHostingSubscription = async (
  subscriptionId: string,
): Promise<CreatorPlanState> => {
  try {
    const api = await apiWithToken();
    const response = await api.get(`/v1/subscriptions/${subscriptionId}/`);
    return toCreatorPlanState(parseSnakeToCamel(response.data) as BackendSubscription);
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'Could not confirm your subscription.'));
  }
};

/** Cancel: keeps working until the period already paid for ends. */
export const cancelHostingSubscription = async (
  subscriptionId: string,
): Promise<CreatorPlanState> => {
  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/subscriptions/${subscriptionId}/cancel/`, {});
    return toCreatorPlanState(parseSnakeToCamel(response.data) as BackendSubscription);
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'Could not cancel your plan.'));
  }
};

/**
 * Keep my plan: undoes a pending cancellation. ⚠️ There is no "resume" /
 * "uncancel" endpoint on the backend - only create and cancel exist - so
 * this stays a local, optimistic flip with no network call. If the
 * creator reloads before the already-paid period ends, re-opening the
 * drawer and picking the same plan again would be the only real fallback
 * today.
 */
export const resumeHostingSubscription = async (
  current: CreatorPlanState,
): Promise<CreatorPlanState> => ({ ...current, status: 'active' });
