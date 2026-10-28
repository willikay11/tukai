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
    <div className="rounded-18 bg-surface p-1.5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-3.5 pt-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[13.5px] text-ink-muted">
            Account balance
            <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-white px-2 text-[11.5px] font-semibold text-ink-muted">
              <IconComponent iconName="LockIcon" size={12} color="currentColor" />
              Only you
            </span>
          </div>
          <div className="mt-1 text-28 font-bold leading-[1.15] tracking-[-0.6px] text-brand-ink">
            {money(balances.available, balances.currency)}
          </div>
        </div>

        {balances.available > 0 && (
          <button
            type="button"
            onClick={() => setIsWithdrawOpen(true)}
            className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-4 pl-5 text-[14.5px] font-semibold text-white shadow-[0_6px_16px_rgba(4,75,54,0.22)] transition-[filter] hover:brightness-110"
          >
            Withdraw
            <IconComponent iconName="ArrowUpRight01Icon" size={18} color="currentColor" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-surface-muted shadow-sm">
        <div className="min-w-0 bg-white px-3.5 py-3">
          <div className="text-[12.5px] text-ink-muted">Available</div>
          <div className="mt-0.5 truncate text-[14.5px] font-bold text-gray-900">
            {money(balances.available, balances.currency)}
          </div>
        </div>
        <div className="min-w-0 bg-white px-3.5 py-3">
          <div className="text-[12.5px] text-ink-muted">Pending</div>
          <div className="mt-0.5 truncate text-[14.5px] font-bold text-gray-900">
            {money(balances.pending, balances.currency)}
          </div>
        </div>
        <div className="min-w-0 bg-white px-3.5 py-3">
          <div className="text-[12.5px] text-ink-muted">Paid out</div>
          <div className="mt-0.5 truncate text-[14.5px] font-bold text-gray-900">
            {money(balances.paidOut, balances.currency)}
          </div>
        </div>
      </div>

      <WithdrawDrawer
        currency={balances.currency}
        availableBalance={balances.availableBalance}
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
      />
    </div>
  );
};
