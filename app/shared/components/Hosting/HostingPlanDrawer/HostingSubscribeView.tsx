'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Paystack } from '@/components/ui/paystack';
import { HostingPlan } from '@/types/hostingPlan';

const renewalDateLabel = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

/**
 * "Subscribe to {plan}": no billing form of our own - the summary, then
 * Paystack's own hosted checkout loaded straight into the frame, same as
 * BookingPanel's ticket checkout. Once Paystack reports a payment, the
 * frame swaps to the "confirming" panel in its place.
 */
export const HostingSubscribeView = ({
  plan,
  checkoutUrl,
  checkoutPhase,
  error,
  onPaymentSuccess,
}: {
  plan: HostingPlan;
  checkoutUrl: string | null;
  checkoutPhase: 'frame' | 'confirming';
  error?: string | null;
  onPaymentSuccess: (success: boolean) => void;
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2.5 rounded-xl bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-1 gap-x-4">
        <span className="text-base font-bold text-brand-ink">{plan.name} plan</span>
        <span className="whitespace-nowrap text-[15px] font-semibold text-gray-800">
          {plan.priceLabel}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="flex items-start gap-2 text-sm leading-relaxed text-ink">
          <IconComponent
            iconName="Calendar03Icon"
            size={17}
            color="currentColor"
            className="mt-0.5 flex-shrink-0 text-brand"
          />
          Billed monthly. Renews on {renewalDateLabel()}.
        </span>
        {plan.commissionPct != null && (
          <span className="flex items-start gap-2 text-sm leading-relaxed text-ink">
            <IconComponent
              iconName="Ticket01Icon"
              size={17}
              color="currentColor"
              className="mt-0.5 flex-shrink-0 text-brand"
            />
            {plan.commissionPct}% per paid ticket, only when you get paid.
          </span>
        )}
      </div>
    </div>

    {error && (
      <p
        role="alert"
        className="flex items-start gap-2 rounded-xl bg-warn-surface p-3.5 text-[13.5px] leading-relaxed text-warn"
      >
        <IconComponent
          iconName="InformationCircleIcon"
          size={17}
          color="currentColor"
          className="mt-0.5 flex-shrink-0"
        />
        {error}
      </p>
    )}

    <div className="flex flex-col gap-1.5 rounded-[18px] border border-gray-200 bg-gray-50 p-1.5">
      <span className="flex items-center gap-1.5 px-2.5 pb-1 pt-1.5 text-[12.5px] text-ink-muted">
        <IconComponent
          iconName="SquareLock02Icon"
          size={14}
          color="currentColor"
          className="text-brand"
        />
        checkout.paystack.com
      </span>

      {checkoutPhase === 'confirming' ? (
        <div
          role="region"
          aria-label="Paystack checkout"
          className="flex h-[70vh] flex-col gap-5 rounded-[14px] border border-surface-muted bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[13.5px] text-ink-muted">Paying Tukai</span>
            <span className="text-[32px] font-bold tabular-nums leading-[1.15] tracking-[-0.03em] text-brand-ink">
              {plan.priceLabel.split('/')[0].trim()}.00
            </span>
            <span className="text-[14.5px] text-gray-800">{plan.name} plan, billed monthly</span>
          </div>
          <p role="status" className="text-sm leading-relaxed text-brand">
            Confirming your payment with Paystack. This takes a few seconds.
          </p>
        </div>
      ) : (
        <div className="h-[70vh] overflow-hidden rounded-[14px] border border-surface-muted bg-white shadow-sm">
          {checkoutUrl && <Paystack url={checkoutUrl} onPaymentSuccess={onPaymentSuccess} />}
        </div>
      )}
    </div>

    <p className="text-[13px] leading-relaxed text-ink-muted">
      Your plan renews every month until you cancel. Cancel any time from your Dashboard, and you
      keep the plan until the end of the month you paid for.
    </p>
  </div>
);
