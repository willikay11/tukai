'use client';

import { IconComponent } from '@/app/shared/components/Icons';
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
  currentPlanName,
  renewalDateLabel,
  isChangeMode = false,
  onChoose,
  onCompareFeatures,
  disabled = false,
}: {
  plans: HostingPlan[];
  /** What's picked right now - preselected to the current plan, or to nothing yet. */
  selectedPlanId?: HostingPlanId | null;
  /** The plan already paid for, in change mode - drives the "Current plan" badge. */
  currentPlanId?: HostingPlanId | null;
  /** Name of the current plan, for the change-mode lead copy. */
  currentPlanName?: string;
  /** "Mon 23 Nov" - the next renewal date, for the change-mode lead copy. */
  renewalDateLabel?: string | null;
  isChangeMode?: boolean;
  onChoose: (planId: HostingPlanId) => void;
  /** Omitted on the Pricing page, since there's no drawer to close there. */
  onCompareFeatures?: () => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-col gap-[22px]">
    <div className="flex flex-col gap-2">
      <h2 className="text-[22px] font-bold leading-tight tracking-[-0.3px] text-gray-800">
        {isChangeMode ? 'Change your plan' : 'Pick a plan to start hosting'}
      </h2>
      <p className="text-[15px] leading-relaxed text-ink-muted">
        {isChangeMode
          ? `You’re on ${currentPlanName ?? 'a plan'}. A new plan starts straight away, and its price applies from your next renewal${renewalDateLabel ? ` on ${renewalDateLabel}` : ''}.`
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

    {onCompareFeatures && (
      <button
        type="button"
        onClick={onCompareFeatures}
        className="inline-flex h-11 w-fit items-center gap-1.5 text-[15px] font-semibold text-brand hover:underline"
      >
        Compare every feature
        <IconComponent iconName="ArrowRight01Icon" size={18} color="currentColor" />
      </button>
    )}

    {!selectedPlanId && (
      <p className="-mt-2 flex items-start gap-2 text-[13.5px] leading-relaxed text-ink-muted">
        <IconComponent
          iconName="InformationCircleIcon"
          size={17}
          color="currentColor"
          className="mt-0.5 flex-shrink-0 text-brand"
        />
        Pick a plan to continue.
      </p>
    )}
  </div>
);
