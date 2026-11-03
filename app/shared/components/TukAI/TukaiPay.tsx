'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { TukaiPayMethod, useTukai } from '@/context/TukaiContext';
import { cn } from '@/lib/utils';
import { TUKAI_PRICE_LABEL } from '@/utils/tukai';

const METHODS: { id: TukaiPayMethod; label: string; icon: string }[] = [
  { id: 'mpesa', label: 'M-Pesa', icon: 'SmartPhone01Icon' },
  { id: 'card', label: 'Card', icon: 'CreditCardIcon' },
];

/** "3 December 2026", a month from today. */
export const tukaiRenewalDate = (from = new Date()) => {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

/**
 * Paying for the TukAI plan: M-Pesa or a saved card.
 *
 * ⚠️ The saved card is the design's sample ("Visa ending 4242"): the API has
 * no saved-card endpoint yet. See the handoff's open questions 1 and 2 on
 * charging a USD plan through M-Pesa.
 */
export const TukaiPay = () => {
  const { payMethod, setPayMethod, phone, setPhone, isPaying, pay } = useTukai();

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
        <span className="text-[17px] font-bold tabular-nums text-brand-ink">
          {TUKAI_PRICE_LABEL}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        <span id="tk-paywith" className="text-[15px] font-semibold text-gray-800">
          Pay with
        </span>
        <div role="radiogroup" aria-labelledby="tk-paywith" className="flex flex-wrap gap-2">
          {METHODS.map((method) => {
            const on = payMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPayMethod(method.id)}
                className={cn(
                  'inline-flex min-h-12 items-center gap-2 rounded-full pl-4 pr-5 text-[15px] font-medium',
                  on
                    ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                    : 'bg-surface text-gray-800',
                )}
              >
                <IconComponent iconName={method.icon} size={19} color="currentColor" />
                {method.label}
              </button>
            );
          })}
        </div>
      </div>

      {payMethod === 'mpesa' ? (
        <label className="flex flex-col gap-2">
          <span className="text-[15px] font-semibold text-gray-800">M-Pesa number</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="0712 345 678"
            className="h-14 w-full rounded-xl border border-line bg-white px-4 text-[15px] text-gray-800 outline-none focus:border-brand focus:shadow-[0_0_0_3px_theme(colors.surface.brand)]"
          />
          <span className="text-[13px] leading-[1.45] text-ink-muted">
            You get a prompt on your phone to enter your M-Pesa PIN.
          </span>
        </label>
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3.5">
          <IconComponent
            iconName="CreditCardIcon"
            size={22}
            color="currentColor"
            className="flex-shrink-0 text-brand"
          />
          <span className="min-w-0 flex-1 text-[15px] text-gray-800">Visa ending 4242</span>
          <span className="text-[13px] text-ink-muted">Expires 08/28</span>
        </div>
      )}

      <button
        type="button"
        onClick={pay}
        aria-busy={isPaying}
        className="flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-6 text-base font-semibold text-white hover:brightness-[1.06]"
      >
        {isPaying && (
          <span
            aria-hidden="true"
            className="h-5 w-5 flex-shrink-0 animate-auth-spin rounded-full border-[2.5px] border-white/35 border-t-white"
          />
        )}
        {isPaying ? 'Confirming payment' : `Pay ${TUKAI_PRICE_LABEL}`}
      </button>
    </div>
  );
};
