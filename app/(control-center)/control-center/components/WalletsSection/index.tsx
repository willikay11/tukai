'use client';

import { useState } from 'react';

import { useGetWallets, useSetActiveWallet } from '@/app/(experiences)/hooks/usePayment';
import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Wallet } from '@/types/payment';

import { activeWallet, walletHolder, walletLabel } from './wallets';

/**
 * Where a host's payouts go.
 *
 * The create flow can add and edit these while an experience is being made;
 * outside it there was nowhere to see them at all, and nothing anywhere called
 * `set-active` - so a host with two accounts could not choose which one the
 * money went to.
 */
export const WalletsSection = ({ onAddWallet }: { onAddWallet?: () => void }) => {
  const { toast } = useToast();
  const { data: response, isLoading } = useGetWallets();
  const { mutate: makeActive, isPending, variables } = useSetActiveWallet();
  const [justActivated, setJustActivated] = useState<string | null>(null);

  const wallets: Wallet[] = response?.data?.results ?? response?.data ?? [];
  const list = Array.isArray(wallets) ? wallets : [];
  const active = activeWallet(list);

  const activate = (wallet: Wallet) =>
    makeActive(wallet.id, {
      onSuccess: () => {
        setJustActivated(wallet.id);
        toast({
          title: 'Active wallet changed',
          description: `Payouts now go to ${walletLabel(wallet)}.`,
          variant: 'success',
        });
      },
      onError: (error: Error) =>
        toast({
          title: 'Could not change the active wallet',
          description: error.message,
          variant: 'destructive',
        }),
    });

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />;
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-gray-900">Payout accounts</h3>
          <p className="mt-0.5 text-13 text-ink-muted">
            Withdrawals go to the account marked active.
          </p>
        </div>

        {onAddWallet && (
          <Button
            type="button"
            variant="canvas-outline"
            onClick={onAddWallet}
            className="rounded-full px-4"
          >
            <span className="flex items-center gap-2">
              <IconComponent iconName="AddCircleIcon" size={16} color="currentColor" />
              Add account
            </span>
          </Button>
        )}
      </div>

      {list.length === 0 ? (
        <p className="py-6 text-sm text-ink-subtle">
          No payout account yet. Add one and your earnings can be withdrawn to it.
        </p>
      ) : (
        <ul className="mt-3">
          {list.map((wallet) => {
            const isActive = active?.id === wallet.id || justActivated === wallet.id;

            return (
              <li
                key={wallet.id}
                className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                    isActive ? 'bg-surface-brand text-brand' : 'bg-surface text-ink-subtle',
                  )}
                >
                  <IconComponent
                    iconName={wallet.walletType === 'phone' ? 'SmartPhone01Icon' : 'BankIcon'}
                    size={18}
                    color="currentColor"
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {walletLabel(wallet)}
                  </p>
                  <p className="truncate text-13 text-ink-muted">{walletHolder(wallet)}</p>
                </div>

                {isActive ? (
                  <span className="flex-shrink-0 rounded-full bg-surface-brand px-2.5 py-0.5 text-13 font-semibold text-brand-deep">
                    Active
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="canvas-outline"
                    size="sm"
                    className="flex-shrink-0 rounded-full"
                    isLoading={isPending && variables === wallet.id}
                    onClick={() => activate(wallet)}
                  >
                    Make active
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
