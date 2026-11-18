'use client';

import { useCallback } from 'react';

import { ToastAction, ToastActionElement } from '@/components/ui/toast';
import { useHostingPlan } from '@/context/HostingPlanContext';
import { planLimitOf } from '@/utils/plan-limits';

/**
 * A "See plans" button for an error toast, when the error is the API saying
 * the host's plan doesn't allow what they tried: publishing past the
 * live-experience limit, a recurring experience, or a discount code. The
 * API's own message already says what's not included; this is the way
 * forward. Any other error gets no button.
 *
 * Built where the toast is raised because the Toaster renders outside the
 * hosting plan provider: the button carries the open call with it.
 */
export const usePlanLimitAction = () => {
  const hostingPlan = useHostingPlan();

  return useCallback(
    (error: unknown): ToastActionElement | undefined => {
      if (!hostingPlan || !planLimitOf(error)) return undefined;

      return (
        <ToastAction
          altText="See hosting plans"
          onClick={() => hostingPlan.openHostingPlanFlow({ view: 'choose' })}
        >
          See plans
        </ToastAction>
      );
    },
    [hostingPlan],
  );
};
