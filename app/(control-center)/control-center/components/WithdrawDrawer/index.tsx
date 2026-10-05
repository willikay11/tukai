'use client';

import { useState } from 'react';

import { usePayoutQuote, useRequestWithdrawal } from '@/app/(experiences)/hooks/usePayment';
import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { PayoutQuote, payoutAmount } from '@/types/payment';

const money = (currency: string, value?: string | null) =>
  `${currency} ${payoutAmount(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

const QuoteRow = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <div className="flex items-center justify-between gap-4 py-1.5">
    <span className={cn('text-15', strong ? 'font-semibold text-gray-900' : 'text-ink-muted')}>
      {label}
    </span>
    <span className={cn('text-15', strong ? 'font-bold text-gray-900' : 'text-gray-900')}>
      {value}
    </span>
  </div>
);

/**
 * Taking money out.
 *
 * The fees are the API's to work out, so the quote is asked for as the amount
 * is typed and shown before anything is committed - a host sees what will
 * actually land, not the number they typed. The wallet it goes to is whichever
 * one is active.
 */
export const WithdrawDrawer = ({
  currency = 'KES',
  availableBalance,
  isOpen,
  onClose,
}: {
  currency?: string;
  availableBalance: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: quoteResponse, isFetching } = usePayoutQuote(amount, currency);
  const { mutate: withdraw, isPending } = useRequestWithdrawal();

  const quote: PayoutQuote | null = quoteResponse?.success ? quoteResponse.data : null;
  const available = payoutAmount(availableBalance);
  const requested = payoutAmount(amount);

  const close = () => {
    setAmount('');
    setError(null);
    onClose();
  };

  const submit = () => {
    setError(null);

    if (requested <= 0) {
      setError('Enter how much you want to withdraw.');
      return;
    }

    // Checked here as well so the obvious case does not need a round trip; the
    // API is still the authority on its own limits
    if (requested > available) {
      setError(`You can withdraw up to ${money(currency, availableBalance)} right now.`);
      return;
    }

    withdraw(
      { amount, currency },
      {
        onSuccess: () => {
          toast({
            title: 'Withdrawal requested',
            description: quote
              ? `${money(currency, quote.netAmount)} is on its way to your active wallet.`
              : 'It is on its way to your active wallet.',
            variant: 'success',
          });
          close();
        },
        onError: (failure: Error) => setError(failure.message),
      },
    );
  };

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && close()} width="narrow">
      <div className="flex min-h-full flex-col">
        <div className="flex items-center gap-3 border-b border-line px-6 py-4">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-brand"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
          </button>
          <h2 className="text-19 font-bold tracking-tight text-gray-900">Withdraw</h2>
        </div>

        <div className="flex flex-1 flex-col gap-6 px-6 py-6">
          <div className="flex flex-col gap-2.5">
            <label htmlFor="withdraw-amount" className="text-15 font-semibold text-gray-900">
              How much?{' '}
              <span className="font-normal text-ink-muted">
                ({money(currency, availableBalance)} available)
              </span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-15 text-ink-muted">
                {currency}
              </span>
              <input
                id="withdraw-amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value.replace(/[^0-9.]/g, '').slice(0, 12));
                  setError(null);
                }}
                placeholder="0"
                className={cn(
                  'h-[52px] w-full rounded-14 border bg-white pl-16 pr-4 text-15 text-gray-900 outline-none',
                  'focus:border-brand focus:ring-4 focus:ring-surface-brand',
                  error ? 'border-danger' : 'border-line',
                )}
              />
            </div>
            <button
              type="button"
              onClick={() => setAmount(String(available))}
              className="self-start text-13 font-medium text-brand hover:underline"
            >
              Withdraw everything available
            </button>
          </div>

          {/* What will actually land, before anything is committed */}
          {requested > 0 && (
            <div className="rounded-14 bg-surface px-4 py-3">
              {isFetching && !quote ? (
                <p className="text-15 text-ink-muted">Working out the fees…</p>
              ) : quote ? (
                <>
                  <QuoteRow label="You asked for" value={money(currency, quote.requestedAmount)} />
                  <QuoteRow
                    label="Transfer fee"
                    value={money(currency, quote.paystackTransferFee)}
                  />
                  <QuoteRow
                    label="Tukai payout fee"
                    value={money(currency, quote.tukaiPayoutFee)}
                  />
                  <div className="my-1 h-px bg-line" />
                  <QuoteRow label="You receive" value={money(currency, quote.netAmount)} strong />

                  {quote.limitMessage && (
                    <p className="mt-2 text-13 leading-relaxed text-ink-muted">
                      {quote.limitMessage}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-15 text-ink-muted">
                  The fees could not be worked out. You can still ask for the withdrawal; the amount
                  that lands will be confirmed by the payout.
                </p>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="text-13 text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
          <Button type="button" variant="ghost" onClick={close} className="text-danger">
            Cancel
          </Button>
          <Button
            type="button"
            variant="lime"
            onClick={submit}
            isLoading={isPending}
            className="rounded-full px-6"
          >
            Request withdrawal
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
