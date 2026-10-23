'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';
import { HostingPlan } from '@/types/hostingPlan';

const radioLabel = (plan: HostingPlan, isCurrent: boolean, isAvailable: boolean): string => {
  const price = `${plan.priceLabel.split('/')[0].trim()} a month`;
  const parts = [plan.name, price];
  if (plan.commissionPct != null) parts.push(`${plan.commissionPct}% per paid ticket`);
  let label = parts.join(', ');

  if (plan.aiFeatures) label += ', includes TukAI';
  if (isCurrent) label += ', your current plan';
  if (!isAvailable) label += ', coming soon';

  return label;
};

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
}) => {
  // Nothing to subscribe it to yet - the backend has no plan by this name.
  const isAvailable = Boolean(plan.backendId);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={radioLabel(plan, isCurrent, isAvailable)}
      disabled={disabled || !isAvailable}
      onClick={onChoose}
      className={cn(
        'flex w-full flex-col gap-1.5 rounded-[18px] border border-gray-200 bg-gray-50 p-1.5 text-left transition-shadow disabled:cursor-default',
        !isAvailable && 'opacity-60',
        isSelected && 'ring-2 ring-brand',
      )}
    >
      <div className="flex flex-col gap-3.5 rounded-[14px] border border-surface-muted bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-surface-brand text-brand"
          >
            <IconComponent iconName={plan.icon} size={22} color="currentColor" />
          </span>

          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[17px] font-bold text-brand-ink">{plan.name}</span>
              {!isAvailable ? (
                <span className="inline-flex h-6 items-center rounded-full bg-surface px-2.5 text-[12.5px] font-semibold text-ink-muted">
                  Coming soon
                </span>
              ) : (
                <>
                  {plan.isMostPopular && !isCurrent && (
                    <span className="inline-flex h-6 items-center rounded-full bg-lime px-2.5 text-[12.5px] font-semibold text-brand-ink">
                      Most popular
                    </span>
                  )}
                  {isCurrent && (
                    <span className="inline-flex h-6 items-center rounded-full bg-surface-brand px-2.5 text-[12.5px] font-semibold text-brand">
                      Current plan
                    </span>
                  )}
                </>
              )}
            </span>
            <span className="text-sm leading-relaxed text-ink-muted">{plan.tagline}</span>
          </span>

          <span
            aria-hidden="true"
            className={cn(
              'mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
              isSelected ? 'bg-brand text-white' : 'text-transparent ring-2 ring-inset ring-gray-300',
            )}
          >
            <IconComponent iconName="Tick02Icon" size={15} color="currentColor" />
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-surface-muted pt-3.5">
          <span className="inline-flex items-baseline gap-1">
            <span className="text-[26px] font-bold leading-none tracking-[-0.03em] text-brand-ink">
              {plan.priceLabel.split('/')[0].trim()}
            </span>
            <span className="text-sm text-ink-muted">/ month</span>
          </span>
          {plan.commissionPct != null && (
            <span className="inline-flex h-[30px] items-center gap-1.5 rounded-full bg-surface px-3 text-[13px] font-semibold text-gray-800">
              <IconComponent
                iconName="Ticket01Icon"
                size={16}
                color="currentColor"
                className="text-brand"
              />
              {plan.commissionPct}% per paid ticket
            </span>
          )}
        </div>
      </div>

      {plan.features.length > 0 && (
        <div className="grid grid-cols-1 gap-2.5 px-3 py-2 sm:grid-cols-2">
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
        </div>
      )}

      {plan.aiFeatures && (
        // The spec's own light-lime tint (#F2FAD9) for this block has no
        // matching token in the palette - everything else on this card does.
        <div className="flex flex-col gap-3 rounded-xl bg-[#F2FAD9] p-3.5">
          <span className="flex items-center gap-2.5 text-[14.5px] font-bold text-brand-ink">
            <span
              aria-hidden="true"
              className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-lime text-brand-ink"
            >
              <IconComponent iconName="SparklesIcon" size={17} color="currentColor" />
            </span>
            TukAI for your team
          </span>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {plan.aiFeatures.map((feature) => (
              <span
                key={feature.text}
                className="flex items-start gap-2 text-sm leading-snug text-gray-800"
              >
                <IconComponent
                  iconName={feature.icon}
                  size={17}
                  color="currentColor"
                  className="mt-0.5 flex-shrink-0 text-brand-ink"
                />
                {feature.text}
              </span>
            ))}
          </div>
        </div>
      )}
    </button>
  );
};
