/**
 * A creator's hosting plan: what lets an account create and publish
 * experiences.
 *
 * Backed by the backend's generic `/v1/subscriptions/` endpoints (the same
 * ones the unrelated "Tukai Premium" subscription uses) rather than a
 * creator-tier-specific API - there isn't one. The backend currently has
 * exactly one real plan ("Monthly"), not three - so services/hostingPlans.ts
 * matches real plans to the static Basic/Premium/Business catalog below by
 * name where it can, and otherwise synthesizes a plan straight from
 * whatever the backend actually returned. A plan with no `backendId` has
 * nothing to subscribe to yet and is shown disabled rather than offered.
 * The current plan still lives only in memory, for HostingPlanContext's
 * lifetime - never written to localStorage - but is now re-fetched from
 * the backend on mount rather than always starting empty.
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
   * e.g. 8 for "8% per paid ticket". Undefined for a plan synthesized
   * straight from the backend - the generic Plan model has no such field,
   * so this is shown only where the static catalog actually defines it.
   */
  commissionPct?: number;
  /** Hugeicons name for the card's icon tile. */
  icon: string;
  features: string[];
  isMostPopular?: boolean;
  /** Business only: the "TukAI for your team" block. */
  aiFeatures?: HostingPlanAiFeature[];
  /**
   * The real plan's UUID on `/v1/subscriptions/plans/`. Undefined for a
   * static catalog entry the backend has no matching plan for yet - that
   * plan is shown but disabled, since there's nothing real to subscribe
   * it to.
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
