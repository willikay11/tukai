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
  currentPlan: CreatorPlanState;
  hasActivePlan: boolean;

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

  useEffect(() => {
    fetchHostingPlans().then(setPlans);
    fetchCurrentHostingSubscription().then((subscription) => {
      if (subscription) setCurrentPlan(subscription);
    });
  }, []);

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
      hasActivePlan: hasActiveHostingPlan(currentPlan),
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
