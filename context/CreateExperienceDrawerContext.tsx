'use client';

import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { ExperienceStepId } from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
import { CreateExperienceDrawer } from '@/app/shared/components/Experiences/CreateExperienceDrawer';
import { useHostingPlan } from '@/context/HostingPlanContext';

export type OpenCreateExperienceOptions = {
  /** Resumes a specific experience (e.g. a saved draft) instead of starting fresh. */
  experienceId?: string;
  /** Jumps straight to a step, skipping the intro/resume gate. */
  step?: ExperienceStepId;
};

type CreateExperienceDrawerValue = {
  isOpen: boolean;
  options: OpenCreateExperienceOptions;
  openCreateExperience: (opts?: OpenCreateExperienceOptions) => void;
  closeCreateExperience: () => void;
};

const CreateExperienceDrawerContext = createContext<CreateExperienceDrawerValue | null>(null);

/**
 * One Create experience drawer for the whole app - opened from the Create
 * menu, the Dashboard's "No plan yet"/hosting CTA, and anywhere else that
 * starts a new experience or resumes a draft. Unlike the Hosting plan or
 * Connect-a-place drawers, this one holds no mock store of its own: the
 * wizard it renders is the existing, API-backed useCreateExperienceFlow
 * hook, just wired with syncToUrl: false.
 */
export const CreateExperienceDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenCreateExperienceOptions>({});
  // Mounted inside HostingPlanProvider (see app/layout.tsx), so this is
  // always available here - reading it this way gates every entry point
  // (Create menu, Dashboard, Hosting empty state, ...) in one place rather
  // than in each of them.
  const hostingPlan = useHostingPlan();

  const openCreateExperience = useCallback(
    (opts?: OpenCreateExperienceOptions) => {
      // Creating an experience needs an active plan - every entry point
      // opens Choose a plan first instead, same as the design spec's own
      // plan-gating rule. hasActivePlan reads false before the stored plan
      // loads too, same as it would for a real "no plan" account - the read
      // is synchronous enough (localStorage, on mount) that nobody can click
      // faster than it resolves.
      if (hostingPlan && !hostingPlan.hasActivePlan) {
        hostingPlan.openHostingPlanFlow({ view: 'choose' });
        return;
      }

      setOptions(opts ?? {});
      setIsOpen(true);
    },
    [hostingPlan],
  );

  const closeCreateExperience = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CreateExperienceDrawerValue>(
    () => ({ isOpen, options, openCreateExperience, closeCreateExperience }),
    [isOpen, options, openCreateExperience, closeCreateExperience],
  );

  return (
    <CreateExperienceDrawerContext.Provider value={value}>
      {children}
      <CreateExperienceDrawer />
    </CreateExperienceDrawerContext.Provider>
  );
};

/**
 * Returns null outside the provider rather than throwing, so a component
 * can render in a test, or on a screen with no drawer, without one.
 */
export const useCreateExperienceDrawer = (): CreateExperienceDrawerValue | null =>
  useContext(CreateExperienceDrawerContext);
