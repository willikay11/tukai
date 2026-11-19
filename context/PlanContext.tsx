'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useSession } from 'next-auth/react';

import { toast } from '@/app/shared/hooks/useToast';
import {
  createPlanOnServer,
  deletePlanOnServer,
  fetchPlans,
  savePlanOnServer,
} from '@/services/plans';
import {
  DEFAULT_DURATION,
  PLAN_STORAGE_KEY,
  Plan,
  PlanStop,
  moveStop,
  sortedByTime,
} from '@/types/plan';

/**
 * The plan store: every read and write of a plan goes through here.
 *
 * Signed in, plans live on the server (/v1/plans/, DEV-376), so they follow
 * the account to every device. Changes show at once and are saved a moment
 * later, the whole plan at a time; a save that fails says so.
 *
 * Signed out, plans are kept in this browser, as they always were. Signing
 * in moves them to the account once, so nothing made before is lost.
 */
type PlanStoreValue = {
  plans: Plan[];
  /** False until the plans have been read, so nothing flashes empty. */
  isReady: boolean;
  /** Saved to the account, rather than to this browser */
  isSynced: boolean;
  /** Resolves with the new plan once it exists (on the server, when signed in) */
  createPlan: (title?: string, date?: string | null) => Promise<Plan>;
  renamePlan: (planId: string, title: string) => void;
  setPlanDate: (planId: string, date: string | null) => void;
  deletePlan: (planId: string) => void;
  addStop: (planId: string, stop: Omit<PlanStop, 'id'>) => void;
  updateStop: (planId: string, stopId: string, changes: Partial<PlanStop>) => void;
  removeStop: (planId: string, stopId: string) => void;
  reorderStops: (planId: string, from: number, to: number) => void;
  sortStopsByTime: (planId: string) => void;
};

const PlanContext = createContext<PlanStoreValue | null>(null);

/** How long after the last change a plan is saved */
export const PLAN_SAVE_DELAY_MS = 600;

const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Plans kept in this browser, read defensively. */
const readStored = (): Plan[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((plan) => plan && typeof plan.id === 'string')
      .map((plan) => ({
        ...plan,
        title: String(plan.title ?? 'New plan'),
        stops: Array.isArray(plan.stops) ? plan.stops : [],
      }));
  } catch {
    // A browser can refuse storage outright, and a half-written value should
    // cost the reader their plans rather than the whole page
    return [];
  }
};

const writeStored = (plans: Plan[]) => {
  try {
    if (plans.length === 0) window.localStorage.removeItem(PLAN_STORAGE_KEY);
    else window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plans));
  } catch {
    // Storage can be full or blocked; the plans still work for this session
  }
};

/**
 * Moves the plans this browser kept to the account, once. Each goes with its
 * own id as the idempotency key, so a move cut short and tried again doesn't
 * save a plan twice. Only the ones that made it leave the browser.
 */
const moveStoredPlansToAccount = async () => {
  const stored = readStored();
  if (stored.length === 0) return;

  const left: Plan[] = [];
  for (const plan of stored) {
    try {
      await createPlanOnServer(plan, plan.id);
    } catch {
      left.push(plan);
    }
  }
  writeStored(left);
};

export const PlanProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const userId: string | null = (session?.user as { id?: string } | undefined)?.id ?? null;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [isReady, setIsReady] = useState(false);

  // The latest plans, for a save that runs after the change that asked for it
  const latest = useRef<Plan[]>([]);
  latest.current = plans;
  const saveTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  // Read the plans: the account's when signed in, else this browser's
  useEffect(() => {
    if (status === 'loading') return;
    let isCurrent = true;
    setIsReady(false);

    if (!userId) {
      setPlans(readStored());
      setIsReady(true);
      return;
    }

    (async () => {
      try {
        await moveStoredPlansToAccount();
        const loaded = await fetchPlans();
        if (isCurrent) setPlans(loaded);
      } catch (error) {
        if (isCurrent) {
          setPlans([]);
          toast({ description: (error as Error).message, variant: 'destructive' });
        }
      } finally {
        if (isCurrent) setIsReady(true);
      }
    })();

    return () => {
      isCurrent = false;
    };
  }, [userId, status]);

  // Signed out, written to this browser on every change, as before
  useEffect(() => {
    if (!isReady || userId) return;
    writeStored(plans);
  }, [plans, isReady, userId]);

  const saveNow = useCallback((planId: string) => {
    clearTimeout(saveTimers.current.get(planId));
    saveTimers.current.delete(planId);
    const plan = latest.current.find((one) => one.id === planId);
    if (!plan) return;
    savePlanOnServer(plan).catch((error: Error) =>
      toast({
        title: 'Your plan was not saved',
        description: `${error.message}. Your last change is still here; try it again.`,
        variant: 'destructive',
      }),
    );
  }, []);

  const scheduleSave = useCallback(
    (planId: string) => {
      if (!userId) return;
      clearTimeout(saveTimers.current.get(planId));
      saveTimers.current.set(
        planId,
        setTimeout(() => saveNow(planId), PLAN_SAVE_DELAY_MS),
      );
    },
    [userId, saveNow],
  );

  // A change still inside the delay is saved straight away when the page is
  // hidden or left, rather than lost
  useEffect(() => {
    const flush = () => Array.from(saveTimers.current.keys()).forEach(saveNow);
    window.addEventListener('pagehide', flush);
    const onHidden = () => document.visibilityState === 'hidden' && flush();
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      flush();
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [saveNow]);

  const change = useCallback(
    (planId: string, fn: (plan: Plan) => Plan) => {
      setPlans((current) => {
        const next = current.map((plan) => (plan.id === planId ? fn(plan) : plan));
        latest.current = next;
        return next;
      });
      scheduleSave(planId);
    },
    [scheduleSave],
  );

  const value = useMemo<PlanStoreValue>(
    () => ({
      plans,
      isReady,
      isSynced: Boolean(userId),
      createPlan: async (title = 'New plan', date = null) => {
        const draft: Plan = {
          id: newId('plan'),
          title,
          date,
          stops: [],
          dateCreated: new Date().toISOString(),
        };
        const plan = userId ? await createPlanOnServer(draft, draft.id) : draft;

        setPlans((current) => {
          const next = [plan, ...current];
          latest.current = next;
          return next;
        });

        return plan;
      },
      renamePlan: (planId, title) => change(planId, (plan) => ({ ...plan, title })),
      setPlanDate: (planId, date) => change(planId, (plan) => ({ ...plan, date })),
      deletePlan: (planId) => {
        clearTimeout(saveTimers.current.get(planId));
        saveTimers.current.delete(planId);
        setPlans((current) => current.filter((plan) => plan.id !== planId));
        if (userId) {
          deletePlanOnServer(planId).catch((error: Error) =>
            toast({ description: error.message, variant: 'destructive' }),
          );
        }
      },
      addStop: (planId, stop) =>
        change(planId, (plan) => ({
          ...plan,
          stops: [
            ...plan.stops,
            {
              ...stop,
              id: newId('stop'),
              durationMinutes: stop.durationMinutes ?? DEFAULT_DURATION[stop.kind],
            },
          ],
        })),
      updateStop: (planId, stopId, changes) =>
        change(planId, (plan) => ({
          ...plan,
          stops: plan.stops.map((stop) => (stop.id === stopId ? { ...stop, ...changes } : stop)),
        })),
      removeStop: (planId, stopId) =>
        change(planId, (plan) => ({
          ...plan,
          stops: plan.stops.filter((stop) => stop.id !== stopId),
        })),
      reorderStops: (planId, from, to) =>
        change(planId, (plan) => ({ ...plan, stops: moveStop(plan.stops, from, to) })),
      sortStopsByTime: (planId) =>
        change(planId, (plan) => ({ ...plan, stops: sortedByTime(plan.stops) })),
    }),
    [plans, isReady, userId, change],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
};

export const usePlans = (): PlanStoreValue => {
  const value = useContext(PlanContext);

  if (!value) {
    throw new Error('usePlans must be used inside a PlanProvider');
  }

  return value;
};
