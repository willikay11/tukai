/**
 * A creator's hosting plan: what lets an account create and publish
 * experiences.
 *
 * ⚠️ No endpoint backs this yet. There is no backend concept of a creator
 * tier, a hosting subscription, or "does this account have an active plan" -
 * only an unrelated generic "Tukai Premium" subscription exists
 * (types/subscription.ts), with different pricing and no link to hosting.
 * So the current plan lives in the browser, the same way a day plan does
 * (types/plan.ts) - every read and write goes through HostingPlanContext,
 * and nothing reaches into localStorage directly. When a real endpoint
 * exists, the calls in services/hostingPlans.ts become requests and no
 * screen changes.
 */
export type HostingPlanId = 'basic' | 'premium' | 'business';

export type HostingPlanAiFeature = {
  icon: string;
  text: string;
};

export type HostingPlan = {
  id: HostingPlanId;
  name: string;
  tagline: string;
  /** 0 for Basic - it's free, so priceLabel is "Free" and there's no "/ month". */
  priceAmount: number;
  priceCurrency: string;
  /** "$15 / month", or "Free" for a $0 plan - already formatted, since the catalog is static. */
  priceLabel: string;
  /** e.g. 8 for "8% per paid ticket". */
  commissionPct: number;
  /** Hugeicons name for the card's icon tile. */
  icon: string;
  features: string[];
  isMostPopular?: boolean;
  /** Business only: the "TukAI for your team" block. */
  aiFeatures?: HostingPlanAiFeature[];
};

export const isFreePlan = (plan: HostingPlan): boolean => plan.priceAmount === 0;

export type HostingPlanStatus = 'none' | 'active' | 'cancel_pending';

export type HostingPaymentMethod = 'mpesa' | 'card';

export type CreatorPlanState = {
  planId: HostingPlanId | null;
  status: HostingPlanStatus;
  paymentMethod: HostingPaymentMethod | null;
  /** ISO date. Renewal date while active, or when a cancelled plan stops working. */
  currentPeriodEnd: string | null;
  dateSubscribed: string | null;
};

export const HOSTING_PLAN_STORAGE_KEY = 'tukai.hostingPlan.v1';

export const NO_HOSTING_PLAN: CreatorPlanState = {
  planId: null,
  status: 'none',
  paymentMethod: null,
  currentPeriodEnd: null,
  dateSubscribed: null,
};

/** Still lets the account create experiences - active, or cancelled but not yet ended. */
export const hasActiveHostingPlan = (state: CreatorPlanState): boolean =>
  state.status === 'active' || state.status === 'cancel_pending';
