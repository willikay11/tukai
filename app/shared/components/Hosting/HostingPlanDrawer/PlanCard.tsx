'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';
import { HostingPlan } from '@/types/hostingPlan';

export const PlanCard = ({
  plan,
  isSelected,
  isCurrent,
  onChoose,
  disabled = false,
}: {
  plan: HostingPlan;
  isSelected: boolean;
  isCurrent: boolean;
  onChoose: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={isSelected}
    aria-label={`${plan.name}, ${plan.priceLabel}, ${plan.commissionPct}% per paid ticket`}
    disabled={disabled}
    onClick={onChoose}
    className={cn(
      'p-4.5 flex w-full flex-col gap-3.5 rounded-xl text-left transition-colors disabled:cursor-default',
      isSelected ? 'bg-surface-brand' : 'bg-surface',
    )}
  >
    <span className="flex w-full items-start gap-3">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-[17px] font-bold text-brand-ink">{plan.name}</span>
          {plan.isMostPopular && !isCurrent && (
            <span className="inline-flex h-6 items-center rounded-full bg-lime px-2.5 text-[12.5px] font-semibold text-brand-ink">
              Most popular
            </span>
          )}
          {isCurrent && (
            <span className="inline-flex h-6 items-center rounded-full bg-white px-2.5 text-[12.5px] font-semibold text-brand">
              Current plan
            </span>
          )}
        </span>
        <span className="text-sm leading-relaxed text-ink-muted">{plan.tagline}</span>
      </span>

      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
          isSelected ? 'bg-brand text-white' : 'text-transparent ring-2 ring-inset ring-line-brand',
        )}
      >
        <IconComponent iconName="Tick02Icon" size={15} color="currentColor" />
      </span>
    </span>

    <span className="flex flex-wrap items-baseline gap-3.5">
      <span className="inline-flex items-baseline gap-1">
        <span className="text-[28px] font-bold leading-none tracking-[-0.03em] text-brand-ink">
          {plan.priceLabel.split('/')[0].trim()}
        </span>
        <span className="text-sm text-ink-muted">/ month</span>
      </span>
      <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand">
        <IconComponent iconName="Ticket01Icon" size={16} color="currentColor" />
        {plan.commissionPct}% per paid ticket
      </span>
    </span>

    <span className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {plan.features.map((feature) => (
        <span key={feature} className="flex items-start gap-2 text-sm leading-snug text-gray-800">
          <IconComponent
            iconName="Tick02Icon"
            size={17}
            color="currentColor"
            className="mt-0.5 flex-shrink-0 text-brand"
          />
          {feature}
        </span>
      ))}
    </span>
  </button>
);
