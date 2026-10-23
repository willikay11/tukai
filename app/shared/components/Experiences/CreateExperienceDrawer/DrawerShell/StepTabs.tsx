'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

import type { DrawerStepMeta } from '../useCreateExperienceDrawer';

interface StepTabsProps {
  steps: DrawerStepMeta[];
  activeStepIndex: number;
  reachedStepIndex: number;
  onStepChange: (stepId: DrawerStepMeta['id']) => void;
  disabled?: boolean;
}

/**
 * The drawer's sticky step nav (tk-steps / tk-step-tab). Every tab is always
 * clickable - it jumps straight there - except while `disabled` (the intro,
 * or no owned community yet). "Reached" tracks the furthest step ever
 * visited, not whether a step has data in it.
 */
export const StepTabs = ({
  steps,
  activeStepIndex,
  reachedStepIndex,
  onStepChange,
  disabled,
}: StepTabsProps) => (
  <nav
    aria-label="Steps"
    className="sticky top-0 z-[3] -mx-6 -mb-3 mt-[-20px] flex items-center gap-2 overflow-x-auto bg-white px-6 py-3 scrollbar-hide"
  >
    {steps.map((step, index) => {
      const isActive = index === activeStepIndex;
      const isReached = index <= reachedStepIndex;

      return (
        <button
          key={step.id}
          type="button"
          disabled={disabled}
          aria-current={isActive ? 'step' : undefined}
          onClick={() => onStepChange(step.id)}
          className={cn(
            'inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full py-0 pl-3.5 pr-4.5 text-[14.5px] font-medium text-gray-800',
            isReached ? 'bg-surface-pill-active text-brand-deep' : 'bg-surface',
            isActive && 'font-bold',
            disabled && 'cursor-default opacity-60',
          )}
        >
          <IconComponent
            iconName={step.icon}
            size={20}
            color={isReached ? '#066349' : '#5B6B66'}
            variant={isActive ? 'bulk' : 'twotone'}
            className="flex-shrink-0"
          />
          {step.label}
        </button>
      );
    })}
  </nav>
);
