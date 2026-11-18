import { apiWithToken } from '@/services/apiService';
import {
  CreatorPlanState,
  HostingPlan,
  HostingPlanId,
  HostingPlanStatus,
} from '@/types/hostingPlan';
import { moneyAmount } from '@/utils/money';
import { parseApiError } from '@/utils/parseApiError';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

/**
 * Hosting plans, from `GET /v1/subscriptions/plans/?product=hosting`
 * (DEV-458). The API gives each plan's price, commission and limits, and
 * marks one `is_default` (Basic): what a host with no subscription is on.
 *
 * Only presentation is local: the tagline, icon, "most popular" badge and
 * the feature lines the API has no field for, matched by plan name. The
 * lines about limits (live experiences, recurring, discount codes) are
 * written from the plan's own terms, so they change when the admin does.
 */

/** What a plan charges when it doesn't set its own commission. */
export const PLATFORM_COMMISSION_PCT = 4;

type PlanPresentation = Pick<HostingPlan, 'tagline' | 'icon' | 'isMostPopular' | 'aiFeatures'> & {
  /** Feature lines beyond the plan's terms, which the API knows nothing of */
  extraFeatures: string[];
};

const PRESENTATION: Record<string, PlanPresentation> = {
  basic: {
    tagline: 'Start hosting experiences on Tukai.',
    icon: 'Plant02Icon',
    extraFeatures: ['Paid & free ticketing', 'Withdraw to Tukai Wallet', 'Basic analytics'],
  },
  premium: {
    tagline: 'Grow your experience business with advanced tools & visibility.',
    icon: 'Rocket01Icon',
    isMostPopular: true,
    extraFeatures: ['Featured creator badge'],
  },
  business: {
    tagline: 'For operators managing teams & high-volume bookings.',
    icon: 'Building03Icon',
    extraFeatures: ['10+ team members', 'Dedicated account support'],
    aiFeatures: [
      { icon: 'QuillWrite02Icon', text: 'Writes experience pages and day-by-day itineraries' },
      { icon: 'ChartIncreaseIcon', text: 'Suggests prices and dates from your past bookings' },
      { icon: 'BubbleChatIcon', text: 'Drafts replies to guest questions for your team' },
      { icon: 'AnalyticsUpIcon', text: 'Weekly summary of sales, guests and reviews' },
    ],
  },
};

/** The plan as the API sends it, after parseSnakeToCamel. */
export type BackendPlan = {
  id: string;
  product?: string;
  name: string;
  description?: string;
  price: { amount: string; currency: string } | string;
  isDefault?: boolean;
  commissionPercentage?: string | null;
  maxLiveExperiences?: number | null;
  allowsRecurringExperiences?: boolean;
  allowsDiscountCodes?: boolean;
};

type BackendSubscription = {
  id: string;
  plan: string;
  product?: string;
  dateSubscribed: string | null;
  startDate: string | null;
  endDate: string | null;
  autoRenew: boolean;
  nextPaymentDate: string | null;
  status: 'pending' | 'active' | 'cancelled' | 'completed';
};

/** "$15", "KES 1,500", "$3.50" */
const formatPrice = (amount: number, currency: string): string => {
  const figure = Number.isInteger(amount)
    ? amount.toLocaleString('en-US')
    : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === 'USD' ? `$${figure}` : `${currency} ${figure}`;
};

/** The feature lines a plan's own terms say, before any marketing extras. */
export const termFeatures = (
  plan: Pick<
    HostingPlan,
    'maxLiveExperiences' | 'allowsRecurringExperiences' | 'allowsDiscountCodes'
  >,
): string[] => {
  const lines: string[] = [];
  if (plan.maxLiveExperiences === null) {
    lines.push('Unlimited live experiences');
  } else if (typeof plan.maxLiveExperiences === 'number') {
    const plural = plan.maxLiveExperiences === 1 ? '' : 's';
    lines.push(`Up to ${plan.maxLiveExperiences} live experience${plural}`);
  }
  if (plan.allowsRecurringExperiences) lines.push('Recurring experiences');
  if (plan.allowsDiscountCodes) lines.push('Discount codes & coupons');
  return lines;
};

/** A plan from the API, in the shape the plan cards show. */
export const toHostingPlan = (backendPlan: BackendPlan): HostingPlan => {
  const presentation = PRESENTATION[backendPlan.name.trim().toLowerCase()];
  const amount = moneyAmount(backendPlan.price) ?? 0;
  const currency = (typeof backendPlan.price === 'object' && backendPlan.price?.currency) || 'USD';
  const commission =
    backendPlan.commissionPercentage != null
      ? Number.parseFloat(backendPlan.commissionPercentage)
      : NaN;

  const terms = {
    maxLiveExperiences: backendPlan.maxLiveExperiences ?? null,
    allowsRecurringExperiences: Boolean(backendPlan.allowsRecurringExperiences),
    allowsDiscountCodes: Boolean(backendPlan.allowsDiscountCodes),
  };

  return {
    id: backendPlan.id,
    backendId: backendPlan.id,
    name: backendPlan.name,
    tagline:
      presentation?.tagline ?? backendPlan.description ?? `Tukai's ${backendPlan.name} plan.`,
    priceAmount: amount,
    priceCurrency: currency,
    priceLabel: `${formatPrice(amount, currency)} / month`,
    commissionPct: Number.isFinite(commission) ? commission : PLATFORM_COMMISSION_PCT,
    ...terms,
    isDefault: Boolean(backendPlan.isDefault),
    icon: presentation?.icon ?? 'Calendar03Icon',
    features: [...termFeatures(terms), ...(presentation?.extraFeatures ?? [])],
    isMostPopular: presentation?.isMostPopular,
    aiFeatures: presentation?.aiFeatures,
  };
};

/**
 * Shown, disabled, when the API doesn't return a plan of that name: there's
 * nothing to subscribe to, but the line-up keeps its shape. Its terms are
 * unknown, so it lists only its marketing lines.
 */
const missingPlan = (name: string): HostingPlan => {
  const presentation = PRESENTATION[name];
  return {
    id: name,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    tagline: presentation.tagline,
    priceAmount: 0,
    priceCurrency: 'USD',
    priceLabel: '',
    icon: presentation.icon,
    features: presentation.extraFeatures,
    isMostPopular: presentation.isMostPopular,
    aiFeatures: presentation.aiFeatures,
  };
};

let planCache: HostingPlan[] = [];

export const getHostingPlan = (planId: HostingPlanId): HostingPlan | undefined =>
  planCache.find((plan) => plan.id === planId);

/** Basic: the plan a host with no hosting subscription is on. */
export const getDefaultPlan = (): HostingPlan | undefined =>
  planCache.find((plan) => plan.isDefault);

const findPlanByBackendId = (backendId: string): HostingPlan | undefined =>
  planCache.find((plan) => plan.backendId === backendId);

/**
 * The line-up, cheapest first, from the API. A known plan the API didn't
 * return is listed disabled (DEV-451: "Show a plan as disabled only if it's
 * missing from the response"). On failure the line-up is empty.
 */
export const fetchHostingPlans = async (): Promise<HostingPlan[]> => {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/subscriptions/plans/', {
      params: { product: 'hosting' },
    });
    const payload = parseSnakeToCamel(response.data);
    const backendPlans = (
      Array.isArray(payload) ? payload : (payload?.results ?? [])
    ) as BackendPlan[];

    const plans = backendPlans
      .filter((plan) => !plan.product || plan.product === 'hosting')
      .map(toHostingPlan)
      .sort((left, right) => left.priceAmount - right.priceAmount);

    const returned = new Set(plans.map((plan) => plan.name.trim().toLowerCase()));
    const missing = Object.keys(PRESENTATION)
      .filter((name) => !returned.has(name))
      .map(missingPlan);

    planCache = [...plans, ...missing];
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    planCache = [];
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
 * The signed-in account's hosting subscription, if any. Call after
 * fetchHostingPlans: a subscription is matched to its plan by id. Null
 * means no subscription - the host is on the default plan.
 */
export const fetchCurrentHostingSubscription = async (): Promise<CreatorPlanState | null> => {
  try {
    const api = await apiWithToken();
    const response = await api.get('/v1/subscriptions/');
    const subscriptions = (parseSnakeToCamel(response.data)?.results ??
      []) as BackendSubscription[];

    // A TukAI subscription is on the same list; keep the hosting one, and
    // only one that's still running
    const hostingSubscription = subscriptions.find(
      (sub) =>
        (!sub.product || sub.product === 'hosting') &&
        (sub.status === 'active' || sub.status === 'pending') &&
        findPlanByBackendId(sub.plan),
    );
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
    return toCheckout(response.data);
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'Could not start your subscription.'));
  }
};

/** The new subscription and where to pay for it, from a subscribe response. */
const toCheckout = (raw: unknown): HostingCheckout => {
  const data = parseSnakeToCamel(raw) as any;
  const purchasedItem = data?.order?.purchasedItem;

  return {
    subscriptionId: purchasedItem?.type === 'subscription' ? purchasedItem.id : '',
    authorizationUrl: data?.paymentDetails?.authorizationUrl ?? null,
  };
};

/**
 * Moves a subscription to another plan in one step (DEV-400): starts the new
 * plan's subscription and payment, like subscribing. The current plan stays
 * active until the new one is paid, then the backend cancels it (on Paystack
 * too) - so there's no gap, no double billing, and if the payment never
 * completes nothing changes.
 */
export const changeHostingPlan = async (
  subscriptionId: string,
  planId: HostingPlanId,
): Promise<HostingCheckout> => {
  const plan = getHostingPlan(planId);
  if (!plan?.backendId) {
    throw new Error(`${plan?.name ?? 'This plan'} isn't available to switch to right now.`);
  }

  try {
    const api = await apiWithToken();
    const response = await api.post(`/v1/subscriptions/${subscriptionId}/change-plan/`, {
      plan: plan.backendId,
    });
    return toCheckout(response.data);
  } catch (error: any) {
    console.error('API Error:', error.response?.data || error.message);
    throw new Error(parseApiError(error.response?.data, 'Could not switch your plan.'));
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
    // Answers 204 with no body: read the subscription back to see it now ends
    // at the period's close rather than renewing
    await api.post(`/v1/subscriptions/${subscriptionId}/cancel/`, {});
    const response = await api.get(`/v1/subscriptions/${subscriptionId}/`);
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
