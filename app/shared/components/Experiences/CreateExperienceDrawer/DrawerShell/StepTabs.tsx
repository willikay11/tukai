'use client';

import { useEffect, useRef } from 'react';

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

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The drawer's sticky step nav (tk-steps / tk-step-tab). Every tab is always
 * clickable - it jumps straight there - except while `disabled` (the intro,
 * or no owned community yet). "Reached" tracks the furthest step ever
 * visited, not whether a step has data in it.
 *
 * The row scrolls sideways, so it follows the current step: whichever way the
 * step changed, its tab is brought into view (DEV-505).
 */
export const StepTabs = ({
  steps,
  activeStepIndex,
  reachedStepIndex,
  onStepChange,
  disabled,
}: StepTabsProps) => {
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const nav = navRef.current;
    const tab = tabRefs.current[activeStepIndex];
    if (!nav || !tab || typeof nav.scrollTo !== 'function') return;

    // Only the row scrolls - scrollIntoView would also move the drawer itself.
    // The nav is sticky, so it is the tab's offsetParent
    const left = tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2;
    nav.scrollTo({
      left: Math.max(0, left),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }, [activeStepIndex]);

  return (
    <nav
      ref={navRef}
      aria-label="Steps"
      className="sticky top-0 z-[3] -mx-6 -mb-3 mt-[-20px] flex items-center gap-2 overflow-x-auto bg-white px-6 py-3 scrollbar-hide"
    >
      {steps.map((step, index) => {
        const isActive = index === activeStepIndex;
        const isReached = index <= reachedStepIndex;

        return (
          <button
            key={step.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            disabled={disabled}
            aria-current={isActive ? 'step' : undefined}
            onClick={() => onStepChange(step.id)}
            className={cn(
              'inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full py-0 pl-[14px] pr-[18px] text-[14.5px] font-medium text-gray-800',
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
};
