'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { HostingPlanDrawer } from '@/app/shared/components/Hosting/HostingPlanDrawer';
import {
  HostingCheckout,
  PLATFORM_COMMISSION_PCT,
  cancelHostingSubscription,
  confirmHostingSubscription,
  fetchCurrentHostingSubscription,
  fetchHostingPlans,
  resumeHostingSubscription,
  startHostingCheckout,
} from '@/services/hostingPlans';
import {
  CreatorPlanState,
  HostingPlan,
  HostingPlanId,
  NO_HOSTING_PLAN,
  hasActiveHostingPlan,
} from '@/types/hostingPlan';

export type HostingPlanDrawerView = 'choose' | 'subscribe';

export type OpenHostingPlanOptions = {
  view?: HostingPlanDrawerView;
  /** Preselects a plan, e.g. from a Pricing page plan button. */
  planId?: HostingPlanId;
};

type HostingPlanContextValue = {
  isOpen: boolean;
  options: OpenHostingPlanOptions;
  openHostingPlanFlow: (opts?: OpenHostingPlanOptions) => void;
  closeHostingPlanFlow: () => void;

  plans: HostingPlan[];
  /** The host's hosting subscription. planId is null without one. */
  currentPlan: CreatorPlanState;
  /** Pays for a hosting plan (active, or cancelled but not ended yet). */
  hasActivePlan: boolean;
  /** Basic: what a host with no hosting subscription is on. */
  defaultPlan: HostingPlan | null;
  /**
   * The plan the host is on: their subscription's, or else the default.
   * What "Current plan" and the fee shown on tickets go by.
   */
  effectivePlanId: HostingPlanId | null;
  /** Can create and publish experiences: a paid plan, or the default one. */
  canHost: boolean;

  /** Creates the pending subscription and returns where to pay for it. */
  isStartingCheckout: boolean;
  startCheckout: (planId: HostingPlanId) => Promise<HostingCheckout>;
  /** Reads the subscription back once Paystack reports success. */
  isConfirming: boolean;
  confirmSubscription: (subscriptionId: string) => Promise<CreatorPlanState>;
  isCancelling: boolean;
  cancel: () => Promise<void>;
  isResuming: boolean;
  resume: () => Promise<void>;
};

const HostingPlanContext = createContext<HostingPlanContextValue | null>(null);

/**
 * One Hosting plan drawer for the whole app, opened from the Dashboard
 * hosting-plan card, the Pricing page, and (once an active plan is
 * required) the Create experience entry points.
 *
 * Backed by the backend's generic `/v1/subscriptions/` endpoints - see
 * services/hostingPlans.ts for why the catalog is still local. The current
 * plan itself is never persisted to localStorage: it is fetched fresh from
 * the backend on mount and otherwise lives only in memory here.
 */
export const HostingPlanProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenHostingPlanOptions>({});

  const [plans, setPlans] = useState<HostingPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CreatorPlanState>(NO_HOSTING_PLAN);

  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  // Plans first: a subscription is matched to its plan by id, so reading it
  // before the plans have loaded found no match and the host looked plan-less
  useEffect(() => {
    let cancelled = false;
    fetchHostingPlans()
      .then((loaded) => {
        if (cancelled) return null;
        setPlans(loaded);
        return fetchCurrentHostingSubscription();
      })
      .then((subscription) => {
        if (!cancelled && subscription) setCurrentPlan(subscription);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const defaultPlan = useMemo(() => plans.find((plan) => plan.isDefault) ?? null, [plans]);
  const hasActivePlan = hasActiveHostingPlan(currentPlan);
  const effectivePlanId = hasActivePlan ? currentPlan.planId : (defaultPlan?.id ?? null);

  const openHostingPlanFlow = useCallback((opts?: OpenHostingPlanOptions) => {
    setOptions(opts ?? {});
    setIsOpen(true);
  }, []);

  const closeHostingPlanFlow = useCallback(() => setIsOpen(false), []);

  const startCheckout = useCallback(async (planId: HostingPlanId) => {
    setIsStartingCheckout(true);
    try {
      return await startHostingCheckout(planId);
    } finally {
      setIsStartingCheckout(false);
    }
  }, []);

  const confirmSubscription = useCallback(async (subscriptionId: string) => {
    setIsConfirming(true);
    try {
      const confirmed = await confirmHostingSubscription(subscriptionId);
      setCurrentPlan(confirmed);
      return confirmed;
    } finally {
      setIsConfirming(false);
    }
  }, []);

  const cancel = useCallback(async () => {
    if (!currentPlan.subscriptionId) return;

    setIsCancelling(true);
    try {
      setCurrentPlan(await cancelHostingSubscription(currentPlan.subscriptionId));
    } finally {
      setIsCancelling(false);
    }
  }, [currentPlan.subscriptionId]);

  const resume = useCallback(async () => {
    setIsResuming(true);
    try {
      setCurrentPlan(await resumeHostingSubscription(currentPlan));
    } finally {
      setIsResuming(false);
    }
  }, [currentPlan]);

  const value = useMemo<HostingPlanContextValue>(
    () => ({
      isOpen,
      options,
      openHostingPlanFlow,
      closeHostingPlanFlow,
      plans,
      currentPlan,
      hasActivePlan,
      defaultPlan,
      effectivePlanId,
      canHost: hasActivePlan || Boolean(defaultPlan),
      isStartingCheckout,
      startCheckout,
      isConfirming,
      confirmSubscription,
      isCancelling,
      cancel,
      isResuming,
      resume,
    }),
    [
      isOpen,
      options,
      openHostingPlanFlow,
      closeHostingPlanFlow,
      plans,
      currentPlan,
      hasActivePlan,
      defaultPlan,
      effectivePlanId,
      isStartingCheckout,
      startCheckout,
      isConfirming,
      confirmSubscription,
      isCancelling,
      cancel,
      isResuming,
      resume,
    ],
  );

  return (
    <HostingPlanContext.Provider value={value}>
      {children}
      {/* Reads everything it needs (isOpen, options, the plan store) back
          off this same context, rather than through props - it is always
          rendered inside this provider. */}
      <HostingPlanDrawer />
    </HostingPlanContext.Provider>
  );
};

/**
 * Returns null outside the provider rather than throwing, so a component
 * (e.g. a dashboard card in a test) can render without one.
 */
export const useHostingPlan = (): HostingPlanContextValue | null => useContext(HostingPlanContext);

/** "8%", "3.5%", "1.75%" */
export const formatFeePct = (pct: number): string => `${Number(pct.toFixed(2))}%`;

/**
 * Tukai's fee on each paid ticket for this host: their plan's commission,
 * Basic's when they have no subscription, the platform default (4%) when
 * neither is known. Splitting the fee means half of it each (DEV-350).
 */
export const useHostingFee = (): { ratePct: number; planName: string | null } => {
  const hostingPlan = useHostingPlan();
  const plan = hostingPlan?.plans.find((candidate) => candidate.id === hostingPlan.effectivePlanId);
  return {
    ratePct: plan?.commissionPct ?? PLATFORM_COMMISSION_PCT,
    planName: plan?.name ?? null,
  };
};
