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
  cancelPlan as cancelPlanRequest,
  changePlan as changePlanRequest,
  fetchHostingPlans,
  resumePlan as resumePlanRequest,
  startFreePlan as startFreePlanRequest,
  subscribeToPlan as subscribeToPlanRequest,
} from '@/services/hostingPlans';
import {
  CreatorPlanState,
  HOSTING_PLAN_STORAGE_KEY,
  HostingPaymentMethod,
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
  /** False until the stored plan state has been read, so nothing flashes "no plan". */
  isReady: boolean;
  currentPlan: CreatorPlanState;
  hasActivePlan: boolean;

  isSubscribing: boolean;
  subscribe: (planId: HostingPlanId, paymentMethod: HostingPaymentMethod) => Promise<void>;
  /** Basic: no payment step. */
  isStartingFreePlan: boolean;
  startFreePlan: (planId: HostingPlanId) => Promise<void>;
  isChangingPlan: boolean;
  changeToPlan: (planId: HostingPlanId) => Promise<void>;
  isCancelling: boolean;
  cancel: () => Promise<void>;
  isResuming: boolean;
  resume: () => Promise<void>;
};

const HostingPlanContext = createContext<HostingPlanContextValue | null>(null);

/** Anything stored by an older build, read defensively. */
const readStored = (): CreatorPlanState => {
  if (typeof window === 'undefined') return NO_HOSTING_PLAN;

  try {
    const raw = window.localStorage.getItem(HOSTING_PLAN_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (!parsed || typeof parsed !== 'object') return NO_HOSTING_PLAN;

    return { ...NO_HOSTING_PLAN, ...parsed };
  } catch {
    // A browser can refuse storage outright, and a half-written value should
    // cost the reader their plan rather than the whole page
    return NO_HOSTING_PLAN;
  }
};

/**
 * One Hosting plan drawer for the whole app, opened from the Dashboard
 * hosting-plan card, the Pricing page, and (once an active plan is
 * required) the Create experience entry points.
 *
 * Also holds the mocked plan store: there is no backend yet for a creator
 * tier, a hosting subscription, or payment, so the current plan lives in
 * this browser - see types/hostingPlan.ts and services/hostingPlans.ts.
 * Swapping in real endpoints later only touches the service calls below.
 */
export const HostingPlanProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenHostingPlanOptions>({});

  const [plans, setPlans] = useState<HostingPlan[]>([]);
  // Read synchronously (a lazy initializer, not an effect) so the very first
  // render already has the real stored plan - an effect would still be
  // pending on the first render after mount, and a caller gating on
  // hasActivePlan from a child's own mount effect (e.g. a drawer opened as
  // soon as the app loads) would read the default before it ran.
  const [currentPlan, setCurrentPlan] = useState<CreatorPlanState>(() => readStored());
  // Kept in the context value for API symmetry with the other local stores
  // (e.g. PlanContext) - always true here, since currentPlan above is never
  // stale the way an effect-driven read would be for one render.
  const isReady = true;

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isStartingFreePlan, setIsStartingFreePlan] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  useEffect(() => {
    fetchHostingPlans().then(setPlans);
  }, []);

  // Written on every change, so a reload finds what was there
  useEffect(() => {
    try {
      window.localStorage.setItem(HOSTING_PLAN_STORAGE_KEY, JSON.stringify(currentPlan));
    } catch {
      // Storage can be full or blocked; the plan still works for this session
    }
  }, [currentPlan]);

  const openHostingPlanFlow = useCallback((opts?: OpenHostingPlanOptions) => {
    setOptions(opts ?? {});
    setIsOpen(true);
  }, []);

  const closeHostingPlanFlow = useCallback(() => setIsOpen(false), []);

  const subscribe = useCallback(
    async (planId: HostingPlanId, paymentMethod: HostingPaymentMethod) => {
      setIsSubscribing(true);
      try {
        setCurrentPlan(await subscribeToPlanRequest(planId, paymentMethod));
      } finally {
        setIsSubscribing(false);
      }
    },
    [],
  );

  const startFreePlan = useCallback(async (planId: HostingPlanId) => {
    setIsStartingFreePlan(true);
    try {
      setCurrentPlan(await startFreePlanRequest(planId));
    } finally {
      setIsStartingFreePlan(false);
    }
  }, []);

  const changeToPlan = useCallback(
    async (planId: HostingPlanId) => {
      setIsChangingPlan(true);
      try {
        setCurrentPlan(await changePlanRequest(planId, currentPlan));
      } finally {
        setIsChangingPlan(false);
      }
    },
    [currentPlan],
  );

  const cancel = useCallback(async () => {
    setIsCancelling(true);
    try {
      setCurrentPlan(await cancelPlanRequest(currentPlan));
    } finally {
      setIsCancelling(false);
    }
  }, [currentPlan]);

  const resume = useCallback(async () => {
    setIsResuming(true);
    try {
      setCurrentPlan(await resumePlanRequest(currentPlan));
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
      isReady,
      currentPlan,
      hasActivePlan: hasActiveHostingPlan(currentPlan),
      isSubscribing,
      subscribe,
      isStartingFreePlan,
      startFreePlan,
      isChangingPlan,
      changeToPlan,
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
      isReady,
      currentPlan,
      isSubscribing,
      subscribe,
      isStartingFreePlan,
      startFreePlan,
      isChangingPlan,
      changeToPlan,
      isCancelling,
      cancel,
      isResuming,
      resume,
    ],
  );

  return (
    <HostingPlanContext.Provider value={value}>
      {children}
      {/* Reads everything it needs (isOpen, options, the mock plan store)
          back off this same context, rather than through props - it is
          always rendered inside this provider. */}
      <HostingPlanDrawer />
    </HostingPlanContext.Provider>
  );
};

/**
 * Returns null outside the provider rather than throwing, so a component
 * (e.g. a dashboard card in a test) can render without one.
 */
export const useHostingPlan = (): HostingPlanContextValue | null => useContext(HostingPlanContext);
