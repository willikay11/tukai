'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';

import { useDashboardBalance } from '../../hooks/useDashboardBalance';
import { WithdrawDrawer } from '../WithdrawDrawer';

export const DashboardBalanceCard = ({ userId }: { userId: string | undefined }) => {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const { totalLabel, balances, availableBalance, pendingBalance } = useDashboardBalance(userId);

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border-[0.5px] border-line-shell bg-shell p-1.5">
      <div className="overflow-hidden rounded-xl border-[0.5px] border-surface bg-white shadow-[0_0_4px_0_rgba(0,0,0,.12)]">
        <div className="flex flex-col gap-4 p-[18px]">
          <h1 className="m-0 text-xl font-bold leading-[1.25] tracking-[-0.35px] text-brand-ink">
            Dashboard
          </h1>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[13.5px] text-ink-muted">
                Account balance
                <span className="inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full bg-surface px-2 text-[11.5px] font-semibold text-ink-muted">
                  <IconComponent iconName="LockIcon" size={12} color="currentColor" />
                  Only you
                </span>
              </div>
              <div className="mt-1 text-[28px] font-bold leading-[1.15] tracking-[-0.6px] text-brand-ink">
                {totalLabel}
              </div>
            </div>

            <Button
              type="button"
              variant="lime"
              onClick={() => setIsWithdrawOpen(true)}
              className="h-12 flex-shrink-0 gap-2 rounded-full pl-[22px] pr-[18px] text-base font-semibold"
            >
              Withdraw
              <IconComponent iconName="ArrowDown02Icon" size={19} color="currentColor" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-px border-t border-surface-muted bg-surface-muted">
          {balances.map((row) => (
            <div
              key={row.label}
              className="flex min-h-[52px] items-center justify-between gap-3 bg-white px-[18px] py-2.5"
            >
              <span className="text-[13.5px] text-ink-muted">{row.label}</span>
              <span className="whitespace-nowrap text-[14.5px] font-bold text-gray-900">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <WithdrawDrawer
        currency="KES"
        availableBalance={availableBalance}
        pending={pendingBalance}
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />
    </div>
  );
};
