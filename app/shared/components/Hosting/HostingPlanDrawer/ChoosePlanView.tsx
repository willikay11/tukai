'use client';

import { HostingPlan, HostingPlanId } from '@/types/hostingPlan';

import { PlanCard } from './PlanCard';

/**
 * The plan picker itself - shared by the Hosting plan drawer and the
 * Pricing page, so both read the same catalog and selection behaviour.
 */
export const ChoosePlanView = ({
  plans,
  selectedPlanId,
  currentPlanId,
  isChangeMode = false,
  onChoose,
  disabled = false,
}: {
  plans: HostingPlan[];
  /** What's picked right now - preselected to the current plan, or to nothing yet. */
  selectedPlanId?: HostingPlanId | null;
  /** The plan already paid for, in change mode - drives the "Current plan" badge. */
  currentPlanId?: HostingPlanId | null;
  isChangeMode?: boolean;
  onChoose: (planId: HostingPlanId) => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-[22px]">
    <div className="flex flex-col gap-2">
      <h2 className="text-[22px] font-bold leading-tight tracking-[-0.3px] text-gray-800">
        {isChangeMode ? 'Change your plan' : 'Pick a plan to start hosting'}
      </h2>
      <p className="text-[15px] leading-relaxed text-ink-muted">
        {isChangeMode
          ? 'A new plan starts right away. Its price applies from your next renewal.'
          : 'You need a plan to create experiences on Tukai. Every plan includes ticketing, payouts and community tools, and you can change or cancel any time.'}
      </p>
    </div>

    <div role="radiogroup" aria-label="Plans" className="flex flex-col gap-2.5">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isSelected={plan.id === selectedPlanId}
          isCurrent={isChangeMode && plan.id === currentPlanId}
          disabled={disabled || (isChangeMode && plan.id === currentPlanId)}
          onChoose={() => onChoose(plan.id)}
        />
      ))}
    </div>
  </div>
);
