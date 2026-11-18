/**
 * A creator's hosting plan: what lets an account create and publish
 * experiences, at what fee, with which limits.
 *
 * Read from `GET /v1/subscriptions/plans/?product=hosting` (DEV-458): each
 * plan's price, commission and limits come from the API. Only the
 * marketing copy (tagline, icon, extra feature lines) is local, matched by
 * plan name in services/hostingPlans.ts. One plan is the default
 * (`isDefault`, Basic): a host with no hosting subscription gets its terms
 * and hosts on it. The current plan lives only in memory, for
 * HostingPlanContext's lifetime, re-fetched from the backend on mount.
 */
export type HostingPlanId = string;

export type HostingPlanAiFeature = {
  icon: string;
  text: string;
};

export type HostingPlan = {
  id: HostingPlanId;
  name: string;
  tagline: string;
  priceAmount: number;
  priceCurrency: string;
  /** "$15 / month" - already formatted, since the catalog is static. */
  priceLabel: string;
  /**
   * Tukai's fee on each paid ticket, e.g. 8 for "8% per paid ticket". A
   * plan that doesn't set one charges the platform default (4%).
   */
  commissionPct?: number;
  /** How many experiences can be published at once. Null means no limit. */
  maxLiveExperiences?: number | null;
  allowsRecurringExperiences?: boolean;
  allowsDiscountCodes?: boolean;
  /** Basic: what a host with no hosting subscription is on. */
  isDefault?: boolean;
  /** Hugeicons name for the card's icon tile. */
  icon: string;
  features: string[];
  isMostPopular?: boolean;
  /** Business only: the "TukAI for your team" block. */
  aiFeatures?: HostingPlanAiFeature[];
  /**
   * The plan's UUID on `/v1/subscriptions/plans/`. Undefined only for a
   * plan the API didn't return: it's shown, but disabled, since there's
   * nothing to subscribe to.
   */
  backendId?: string;
};

export type HostingPlanStatus = 'none' | 'active' | 'cancel_pending';

/**
 * Mirrors the handoff's own `Subscription` type - every plan is paid
 * through Paystack, so there's no payment-method field to track here (that
 * choice happens on Paystack's own checkout page, never on ours).
 */
export type CreatorPlanState = {
  planId: HostingPlanId | null;
  status: HostingPlanStatus;
  /** ISO date. Renewal date while active, or when a cancelled plan stops working. */
  currentPeriodEnd: string | null;
  dateSubscribed: string | null;
  /**
   * The real Subscription's UUID (`order.purchased_item.id` from the
   * create response, or `id` from a fetched subscription record) - needed
   * to cancel it. Null for `NO_HOSTING_PLAN`.
   */
  subscriptionId: string | null;
};

export const NO_HOSTING_PLAN: CreatorPlanState = {
  planId: null,
  status: 'none',
  currentPeriodEnd: null,
  dateSubscribed: null,
  subscriptionId: null,
};

/** Still lets the account create experiences - active, or cancelled but not yet ended. */
export const hasActiveHostingPlan = (state: CreatorPlanState): boolean =>
  state.status === 'active' || state.status === 'cancel_pending';
