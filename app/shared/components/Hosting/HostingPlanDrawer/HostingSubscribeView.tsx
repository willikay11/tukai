'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { HostingPaymentMethod, HostingPlan } from '@/types/hostingPlan';

const FIELD_CLASSES =
  'h-14 rounded-xl border-line pl-4 focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_#E8F1ED]';

const renewalDateLabel = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const HostingSubscribeView = ({
  plan,
  paymentMethod,
  onPaymentMethodChange,
  mpesaNumber,
  onMpesaNumberChange,
  cardNumber,
  onCardNumberChange,
  expiry,
  onExpiryChange,
  cvc,
  onCvcChange,
  error,
  isSubmitting,
}: {
  plan: HostingPlan;
  paymentMethod: HostingPaymentMethod;
  onPaymentMethodChange: (method: HostingPaymentMethod) => void;
  mpesaNumber: string;
  onMpesaNumberChange: (value: string) => void;
  cardNumber: string;
  onCardNumberChange: (value: string) => void;
  expiry: string;
  onExpiryChange: (value: string) => void;
  cvc: string;
  onCvcChange: (value: string) => void;
  error?: string | null;
  isSubmitting?: boolean;
}) => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-3 rounded-xl bg-surface p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-1 gap-x-4">
        <span className="text-base font-bold text-brand-ink">{plan.name} plan</span>
        <span className="whitespace-nowrap text-[15px] font-semibold text-gray-800">
          {plan.priceLabel}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
          <IconComponent
            iconName="Calendar03Icon"
            size={17}
            color="currentColor"
            className="mt-0.5 flex-shrink-0 text-brand"
          />
          Billed monthly. Renews on {renewalDateLabel()}.
        </span>
        <span className="flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
          <IconComponent
            iconName="Ticket01Icon"
            size={17}
            color="currentColor"
            className="mt-0.5 flex-shrink-0 text-brand"
          />
          {plan.commissionPct}% per paid ticket, only when you get paid.
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line pt-2.5 text-[17px] font-bold text-gray-800">
        <span>Due today</span>
        <span className="whitespace-nowrap">{plan.priceLabel.split('/')[0].trim()}.00</span>
      </div>
    </div>

    <div className="flex flex-col gap-3">
      <span id="hosting-pay-via" className="text-[15px] font-semibold text-gray-800">
        Pay with
      </span>
      <div role="radiogroup" aria-labelledby="hosting-pay-via" className="flex gap-2.5">
        <button
          type="button"
          role="radio"
          aria-checked={paymentMethod === 'mpesa'}
          onClick={() => onPaymentMethodChange('mpesa')}
          className={cn(
            'inline-flex h-12 items-center gap-2 rounded-full px-5 text-[14.5px] font-semibold',
            paymentMethod === 'mpesa'
              ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
              : 'bg-surface text-gray-800',
          )}
        >
          <IconComponent iconName="SmartPhone01Icon" size={19} color="currentColor" />
          M-Pesa
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={paymentMethod === 'card'}
          onClick={() => onPaymentMethodChange('card')}
          className={cn(
            'inline-flex h-12 items-center gap-2 rounded-full px-5 text-[14.5px] font-semibold',
            paymentMethod === 'card'
              ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
              : 'bg-surface text-gray-800',
          )}
        >
          <IconComponent iconName="CreditCardIcon" size={19} color="currentColor" />
          Card
        </button>
      </div>
    </div>

    {paymentMethod === 'mpesa' ? (
      <label className="flex flex-col gap-2">
        <span className="text-[15px] font-semibold text-gray-800">M-Pesa number</span>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 border-r border-line pr-2.5 text-[15px] font-semibold text-gray-800">
            +254
          </span>
          <Input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={mpesaNumber}
            onChange={(event) => onMpesaNumberChange(event.target.value)}
            className={cn(FIELD_CLASSES, 'pl-[72px]')}
          />
          <IconComponent
            iconName="SmartPhone01Icon"
            size={20}
            color="currentColor"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
          />
        </div>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">
          We send a payment request to this number every month. Approve it with your M-Pesa PIN.
        </p>
      </label>
    ) : (
      <div className="flex flex-col gap-3.5">
        <label className="flex flex-col gap-2">
          <span className="text-[15px] font-semibold text-gray-800">Card number</span>
          <div className="relative">
            <Input
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={(event) => onCardNumberChange(event.target.value)}
              className={cn(FIELD_CLASSES, 'pr-12')}
            />
            <IconComponent
              iconName="CreditCardIcon"
              size={20}
              color="currentColor"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
            />
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-[15px] font-semibold text-gray-800">Expiry date</span>
            <Input
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM / YY"
              value={expiry}
              onChange={(event) => onExpiryChange(event.target.value)}
              className={FIELD_CLASSES}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[15px] font-semibold text-gray-800">Security code</span>
            <div className="relative">
              <Input
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="CVC"
                value={cvc}
                onChange={(event) => onCvcChange(event.target.value.replace(/\D/g, '').slice(0, 4))}
                className={cn(FIELD_CLASSES, 'pr-12')}
              />
              <IconComponent
                iconName="SquareLock02Icon"
                size={20}
                color="currentColor"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
              />
            </div>
          </label>
        </div>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">
          Your card is charged {plan.priceLabel.split('/')[0].trim()} every month until you cancel.
        </p>
      </div>
    )}

    {error && (
      <p className="flex items-start gap-2 rounded-xl bg-warn-surface p-3.5 text-sm leading-relaxed text-warn">
        <IconComponent
          iconName="InformationCircleIcon"
          size={18}
          color="currentColor"
          className="mt-0.5 flex-shrink-0"
        />
        {error}
      </p>
    )}

    {isSubmitting && (
      <p role="status" className="text-sm leading-relaxed text-brand">
        {paymentMethod === 'mpesa'
          ? `We sent a payment request to +254 ${mpesaNumber}. Enter your M-Pesa PIN on your phone to finish.`
          : 'Processing payment…'}
      </p>
    )}

    <p className="text-[13px] leading-relaxed text-ink-muted">
      Your plan renews every month until you cancel. Cancel any time from your Dashboard, and you
      keep the plan until the end of the month you paid for.
    </p>
  </div>
);
