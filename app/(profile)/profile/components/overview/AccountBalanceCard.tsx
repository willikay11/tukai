'use client';

import { useState } from 'react';

import { WithdrawDrawer } from '@/app/(control-center)/control-center/components/WithdrawDrawer';
import { money } from '@/app/(profile)/hooks';
import { IconComponent } from '@/app/shared/components/Icons';

export const AccountBalanceCard = ({
  balances,
}: {
  balances: { currency: string; availableBalance: string; available: number; pending: number; paidOut: number };
}) => {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  return (
    <div className="rounded-xl border-[0.5px] border-line-shell bg-shell p-1.5">
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 pl-3 pr-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13.5px] text-ink-muted">
            Account balance
            <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-white px-2 text-[11.5px] font-semibold text-ink-muted">
              <IconComponent iconName="LockIcon" size={12} color="currentColor" />
              Only you
            </span>
          </div>
          <div className="mt-1 text-[28px] font-bold leading-[1.15] tracking-[-0.6px] text-brand-ink">
            {money(balances.available + balances.pending, balances.currency)}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsWithdrawOpen(true)}
          className="inline-flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-lime pl-[22px] pr-[18px] text-base font-semibold text-brand-ink hover:brightness-[.96]"
        >
          Withdraw
          <IconComponent iconName="ArrowDown02Icon" size={19} color="currentColor" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-surface-muted shadow-[0_1px_3px_rgba(1,51,52,0.07)]">
        <div className="min-w-0 bg-white px-3.5 py-3">
          <div className="text-[12.5px] text-ink-muted">Available</div>
          <div className="mt-[3px] truncate text-[14.5px] font-bold text-gray-900">
            {money(balances.available, balances.currency)}
          </div>
        </div>
        <div className="min-w-0 bg-white px-3.5 py-3">
          <div className="text-[12.5px] text-ink-muted">Pending</div>
          <div className="mt-[3px] truncate text-[14.5px] font-bold text-gray-900">
            {money(balances.pending, balances.currency)}
          </div>
        </div>
        <div className="min-w-0 bg-white px-3.5 py-3">
          <div className="text-[12.5px] text-ink-muted">Paid out</div>
          <div className="mt-[3px] truncate text-[14.5px] font-bold text-gray-900">
            {money(balances.paidOut, balances.currency)}
          </div>
        </div>
      </div>

      <WithdrawDrawer
        currency={balances.currency}
        availableBalance={balances.availableBalance}
        pending={balances.pending}
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />
    </div>
  );
};
