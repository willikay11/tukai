'use client';

import { useRouter } from 'next/navigation';

import numeral from 'numeral';

import { IconComponent } from '@/app/shared/components/Icons';

import { StudioMetrics } from '../utils/studio-metrics';

const HeroStat = ({ value, label, accent }: { value: string; label: string; accent?: boolean }) => (
  <div>
    <p className={`text-lg font-bold ${accent ? 'text-lime' : 'text-white'}`}>{value}</p>
    <p className="text-xs text-white/60">{label}</p>
  </div>
);

export const StudioHero = ({ name, metrics }: { name: string; metrics: StudioMetrics }) => {
  const router = useRouter();
  const money = (amount: number) => `${metrics.currency} ${numeral(amount).format('0,0')}`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B3B2E] via-[#0F4A38] to-[#0B3B2E] p-6 md:p-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <IconComponent iconName="SparklesIcon" size={14} className="text-lime" />
            <span className="text-xs font-bold uppercase tracking-wider text-lime">
              Creator Studio
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold text-white">Karibu back, {name}</h1>
          <p className="mt-1 text-sm text-white/70">
            Here&rsquo;s how your experiences are performing.
          </p>

          <p className="mt-6 text-xs text-white/60">Total revenue &middot; last 8 months</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="text-4xl font-bold text-white md:text-5xl">
              {money(metrics.totalRevenue)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-lime px-3 py-1 text-xs font-bold text-gray-900">
              <IconComponent iconName="ArrowUp01Icon" size={12} color="currentColor" />
              {metrics.revenueChangePercent}%
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-6 divide-x divide-white/15">
            <HeroStat value={money(metrics.thisMonthRevenue)} label="This month" />
            <div className="pl-6">
              <HeroStat value={numeral(metrics.ticketsSold).format('0,0')} label="Tickets sold" />
            </div>
            <div className="pl-6">
              <HeroStat value={money(metrics.withdrawable)} label="Withdrawable" accent />
            </div>
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push('/experiences/create')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-3 text-sm font-semibold text-gray-900"
          >
            <IconComponent iconName="PlusSignIcon" size={16} color="currentColor" />
            New Experience
          </button>

          {/* ⚠️ No payouts/withdrawals endpoint exists */}
          <button
            type="button"
            disabled
            title="Withdrawals are not available yet"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white/80 disabled:opacity-60"
          >
            <IconComponent iconName="ArrowDown01Icon" size={16} color="currentColor" />
            Withdraw Funds
          </button>
        </div>
      </div>
    </div>
  );
};
