'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_DURATION,
  PLAN_STORAGE_KEY,
  Plan,
  PlanStop,
  moveStop,
  sortedByTime,
} from '@/types/plan';

/**
 * The plan store.
 *
 * ⚠️ Plans have no endpoint. Nothing in the API stores an itinerary of a
 * reader's own, so they live in this browser - which is why every read and
 * write goes through here and nothing reaches into localStorage itself. When an
 * endpoint arrives, the calls below become requests and no screen changes.
 *
 * Plans are per-browser, not per-account: a reader who signs in elsewhere will
 * not find them, and the plans page says so.
 */
type PlanStoreValue = {
  plans: Plan[];
  /** False until the stored plans have been read, so nothing flashes empty. */
  isReady: boolean;
  createPlan: (title?: string) => Plan;
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

const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** Anything stored by an older build, read defensively. */
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

export const PlanProvider = ({ children }: { children: React.ReactNode }) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setPlans(readStored());
    setIsReady(true);
  }, []);

  // Written on every change, so a reload finds what was there
  useEffect(() => {
    if (!isReady) return;

    try {
      window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(plans));
    } catch {
      // Storage can be full or blocked; the plans still work for this session
    }
  }, [plans, isReady]);

  const change = useCallback((planId: string, fn: (plan: Plan) => Plan) => {
    setPlans((current) => current.map((plan) => (plan.id === planId ? fn(plan) : plan)));
  }, []);

  const value = useMemo<PlanStoreValue>(
    () => ({
      plans,
      isReady,
      createPlan: (title = 'New plan') => {
        const plan: Plan = {
          id: newId('plan'),
          title,
          date: null,
          stops: [],
          dateCreated: new Date().toISOString(),
        };

        setPlans((current) => [plan, ...current]);

        return plan;
      },
      renamePlan: (planId, title) => change(planId, (plan) => ({ ...plan, title })),
      setPlanDate: (planId, date) => change(planId, (plan) => ({ ...plan, date })),
      deletePlan: (planId) => setPlans((current) => current.filter((plan) => plan.id !== planId)),
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
    [plans, isReady, change],
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
