'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Paystack } from '@/components/ui/paystack';
import { useTukai } from '@/context/TukaiContext';

/** "3 December 2026", a month from today. */
export const tukaiRenewalDate = (from = new Date()) => {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const Spinner = () => (
  <span
    aria-hidden="true"
    className="h-5 w-5 flex-shrink-0 animate-auth-spin rounded-full border-[2.5px] border-brand/25 border-t-brand"
  />
);

/**
 * Paying for the TukAI plan (DEV-373). Opening this step starts a TukAI
 * subscription and loads its Paystack checkout below the plan summary, the
 * same way hosting plans are paid: the buyer picks M-Pesa or card on
 * Paystack's own page. Nothing is charged until Paystack confirms.
 */
export const TukaiPay = () => {
  const {
    priceLabel,
    checkoutUrl,
    isStartingCheckout,
    isConfirmingPayment,
    payError,
    onPaymentResult,
    retryCheckout,
  } = useTukai();

  return (
    <div className="flex w-full max-w-[460px] flex-shrink-0 flex-col gap-[18px] self-center px-0.5 pb-1">
      <div>
        <h2 className="m-0 text-balance text-[22px] font-bold leading-[1.25] tracking-[-0.3px] text-brand-ink">
          Pay for TukAI
        </h2>
        <p className="mt-1.5 text-pretty text-[14.5px] leading-normal text-ink-note">
          Renews on {tukaiRenewalDate()}, then every month. Cancel any time.
        </p>
      </div>

      <div className="flex items-baseline justify-between gap-3 rounded-xl bg-surface px-4 py-3.5">
        <span className="text-[15px] text-gray-800">TukAI, monthly</span>
        <span className="text-[17px] font-bold tabular-nums text-brand-ink">{priceLabel}</span>
      </div>

      <p className="-mt-1 text-[13.5px] leading-[1.45] text-ink-muted">
        Pay with M-Pesa or card on Paystack&rsquo;s secure checkout below.
      </p>

      {isConfirmingPayment ? (
        <div
          role="status"
          className="flex min-h-[200px] items-center justify-center gap-3 rounded-[14px] border border-surface-muted bg-white p-5 text-[14.5px] text-brand"
        >
          <Spinner />
          Confirming your payment with Paystack. This takes a few seconds.
        </div>
      ) : checkoutUrl ? (
        <div
          role="region"
          aria-label="Paystack checkout"
          className="h-[70vh] max-h-[640px] overflow-hidden rounded-[14px] border border-surface-muted bg-white shadow-sm"
        >
          <Paystack url={checkoutUrl} onPaymentSuccess={onPaymentResult} />
        </div>
      ) : isStartingCheckout ? (
        <div
          role="status"
          className="flex min-h-[200px] items-center justify-center gap-3 rounded-[14px] border border-surface-muted bg-white p-5 text-[14.5px] text-ink-muted"
        >
          <Spinner />
          Opening the payment
        </div>
      ) : null}

      {payError && (
        <div className="flex flex-col gap-3">
          <p
            role="alert"
            className="flex items-start gap-2 text-[13.5px] leading-[1.45] text-danger-deep"
          >
            <IconComponent
              iconName="InformationCircleIcon"
              size={17}
              color="currentColor"
              className="mt-px flex-shrink-0"
            />
            {payError}
          </p>
          {!isConfirmingPayment && (
            <button
              type="button"
              onClick={retryCheckout}
              disabled={isStartingCheckout}
              className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-6 text-base font-semibold text-white hover:brightness-[1.06] disabled:opacity-60"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
};
