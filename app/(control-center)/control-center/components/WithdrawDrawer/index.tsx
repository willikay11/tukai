'use client';

import { useState } from 'react';

import { useGetWallets, usePayoutQuote, useRequestWithdrawal } from '@/app/(experiences)/hooks/usePayment';
import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { PayoutQuote, payoutAmount, Wallet } from '@/types/payment';

const money = (currency: string, value?: string | number | null) =>
  `${currency} ${payoutAmount(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

type PayoutDestination = {
  icon: string;
  label: string;
  holder?: string;
  when: string;
};

/** Where a withdrawal lands, read off the account's active payout method. */
const payoutDestination = (wallet?: Wallet): PayoutDestination | null => {
  if (!wallet) return null;

  if (wallet.walletType === 'bank') {
    const last4 = (wallet.accountNumber ?? '').replace(/\D/g, '').slice(-4);
    return {
      icon: 'BankIcon',
      label: `${wallet.bankName ?? 'Bank account'} ending ${last4}`,
      holder: wallet.accountHolderName,
      when: 'Bank transfers arrive in 1 to 2 working days.',
    };
  }

  const last3 = (wallet.phone ?? '').replace(/\D/g, '').slice(-3);
  return {
    icon: 'SmartPhone01Icon',
    label: `M-Pesa ending ${last3}`,
    when: 'M-Pesa withdrawals usually arrive within a few minutes.',
  };
};

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
 * The design reference assumes no fee at withdrawal - Tukai's cut is already
 * taken from ticket sales. The API disagrees: a real Paystack transfer fee is
 * deducted at payout time, which `usePayoutQuote` already prices out live.
 * Dropping that preview to match the mockup would mean telling the account
 * holder they will get more than actually lands, so it stays.
 */
export const WithdrawDrawer = ({
  currency = 'KES',
  availableBalance,
  pending = 0,
  isOpen,
  onClose,
}: {
  currency?: string;
  availableBalance: string;
  pending?: number;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: quoteResponse, isFetching } = usePayoutQuote(amount, currency);
  const { mutate: withdraw, isPending } = useRequestWithdrawal();
  const { data: walletsResponse } = useGetWallets();

  const quote: PayoutQuote | null = quoteResponse?.success ? quoteResponse.data : null;
  const available = payoutAmount(availableBalance);
  const requested = payoutAmount(amount);
  const canWithdraw = available >= 100;

  const walletsPayload = walletsResponse?.data;
  const wallets: Wallet[] = Array.isArray(walletsPayload) ? walletsPayload : walletsPayload?.results ?? [];
  const destination = payoutDestination(wallets.find((wallet) => wallet.isActive) ?? wallets[0]);
  const destinationLabel = destination?.label ?? 'your payout method';

  const chipAmounts = [5000, 10000].filter((amt) => amt < available);

  const close = () => {
    setAmount('');
    setError(null);
    onClose();
  };

  const pickAmount = (value: number) => {
    setAmount(String(value));
    setError(null);
  };

  const submit = () => {
    setError(null);

    if (requested <= 0) {
      setError('Enter how much to withdraw.');
      return;
    }

    if (requested < 100) {
      setError('The smallest withdrawal is KES 100.');
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
            description: `${money(currency, amount)} is on its way to ${destinationLabel}.`,
            variant: 'success',
          });
          close();
        },
        onError: (failure: Error) => setError(failure.message),
      },
    );
  };

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && close()} ariaLabel="Withdraw">
      <div className="flex min-h-full flex-col">
        <div className="flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-[24px] font-bold tracking-[-0.4px] text-gray-900">
            Withdraw
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-danger transition-colors hover:bg-danger-surface"
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-[22px] px-6 pb-9 pt-5">
          <div className="flex flex-col gap-1.5 rounded-xl bg-surface p-[18px]">
            <span className="text-sm text-ink-muted">Available to withdraw</span>
            <span className="text-[28px] font-bold leading-[1.15] tracking-[-0.6px] text-brand-ink">
              {money(currency, availableBalance)}
            </span>
            <p className="text-[13.5px] leading-[1.45] text-ink-muted">
              {money(currency, pending)} is still clearing. Ticket sales come in after Tukai&rsquo;s
              fee, 8% for verified businesses or 4% for other communities, and become available 48
              hours after each experience ends.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
              <label htmlFor="wd-amt" className="text-[15px] font-semibold text-gray-900">
                Amount
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center border-r border-line pr-2.5 text-[15px] font-semibold text-gray-900">
                  {currency}
                </span>
                <input
                  id="wd-amt"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value.replace(/[^0-9.,]/g, '').slice(0, 12));
                    setError(null);
                  }}
                  placeholder="0"
                  className={cn(
                    'h-14 w-full rounded-xl border bg-white pl-[72px] pr-4 text-[15px] text-gray-900 outline-none placeholder:text-ink-subtle',
                    'focus:border-brand focus:ring-[3px] focus:ring-surface-brand',
                    error ? 'border-danger' : 'border-line',
                  )}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {chipAmounts.map((amt) => {
                  const selected = requested === amt;

                  return (
                    <button
                      key={amt}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => pickAmount(amt)}
                      className={cn(
                        'h-11 whitespace-nowrap rounded-full px-4 text-sm hover:brightness-[.97]',
                        selected
                          ? 'bg-surface-brand font-semibold text-brand-deep'
                          : 'bg-surface font-medium text-gray-900',
                      )}
                    >
                      {currency} {amt.toLocaleString('en-US')}
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-pressed={requested === available}
                  onClick={() => pickAmount(available)}
                  className={cn(
                    'h-11 whitespace-nowrap rounded-full px-4 text-sm hover:brightness-[.97]',
                    requested === available
                      ? 'bg-surface-brand font-semibold text-brand-deep'
                      : 'bg-surface font-medium text-gray-900',
                  )}
                >
                  All available
                </button>
              </div>
            </div>

          {/* What will actually land, before anything is committed */}
          {canWithdraw && requested > 0 && (
            <div className="rounded-14 bg-surface px-4 py-3">
              {isFetching && !quote ? (
                <p className="text-15 text-ink-muted">Working out the fees…</p>
              ) : quote ? (
                <>
                  <QuoteRow label="You asked for" value={money(currency, quote.requestedAmount)} />
                  <QuoteRow label="Transfer fee" value={money(currency, quote.paystackTransferFee)} />
                  <QuoteRow label="Tukai payout fee" value={money(currency, quote.tukaiPayoutFee)} />
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

          <div className="flex flex-col gap-2.5">
            <span className="text-[15px] font-semibold text-gray-900">Sends to</span>
            <div className="flex items-center gap-3.5 rounded-xl bg-surface py-2 pl-3 pr-2">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white text-brand">
                <IconComponent iconName={destination?.icon ?? 'Wallet02Icon'} size={21} color="currentColor" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[15px] font-semibold text-gray-900">
                  {destination?.label ?? 'Add how you get paid out'}
                </span>
                {destination?.holder && (
                  <span className="truncate text-[13.5px] text-ink-muted">{destination.holder}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  toast({ description: 'Changing your payout method is coming soon.' })
                }
                aria-label="Change payout method"
                className="h-11 flex-shrink-0 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold text-brand hover:bg-white"
              >
                Change
              </button>
            </div>
            {destination?.when && (
              <p className="text-[13.5px] leading-[1.45] text-ink-muted">{destination.when}</p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl bg-warn-surface px-3.5 py-3 text-[13.5px] leading-[1.45] text-warn"
            >
              <IconComponent
                iconName="InformationCircleIcon"
                size={17}
                color="currentColor"
                className="flex-shrink-0"
              />
              {error}
            </div>
          )}

          {isPending && (
            <p role="status" className="text-sm leading-[1.5] text-brand">
              Sending {money(currency, amount)} to {destinationLabel}.
            </p>
          )}
        </div>

        <div className="flex-shrink-0 px-6 pb-6">
          <button
            type="button"
            onClick={submit}
            disabled={!canWithdraw || isPending}
            aria-busy={isPending}
            className="h-14 w-full rounded-full bg-lime text-base font-semibold text-brand-ink shadow-[0_8px_20px_rgba(176,232,0,.4)] enabled:hover:bg-lime-dark disabled:opacity-40 active:scale-[0.98]"
          >
            {isPending ? 'Sending' : requested > 0 ? `Withdraw ${money(currency, amount)}` : 'Withdraw'}
          </button>
        </div>
      </div>
    </Drawer>
  );
};
