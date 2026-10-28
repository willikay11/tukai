'use client';

import { useState } from 'react';

import moment from 'moment';

import { TransactionRow } from '@/app/(profile)/hooks';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'in' | 'out';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'in', label: 'Money in' },
  { id: 'out', label: 'Money out' },
];

const FIRST_PAGE = 6;

export const RecentTransactions = ({ transactions }: { transactions: TransactionRow[] }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const [showAll, setShowAll] = useState(false);

  const filtered = transactions.filter((row) => filter === 'all' || row.direction === filter);
  const visible = showAll ? filtered : filtered.slice(0, FIRST_PAGE);

  return (
    <div>
      <div className="-mt-3 flex items-center justify-between gap-3">
        <h2 className="text-17 font-bold tracking-[-0.2px] text-brand-ink">Recent transactions</h2>
        {filtered.length > FIRST_PAGE && !showAll && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="h-11 px-1 text-[13.5px] font-semibold text-brand hover:underline"
          >
            See all
          </button>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {FILTERS.map((item) => {
          const selected = item.id === filter;

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(item.id)}
              className={cn(
                'h-11 whitespace-nowrap rounded-full px-[18px] text-sm transition-colors',
                selected ? 'bg-surface-brand font-semibold text-brand-deep' : 'bg-surface text-gray-900',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="mt-3 text-sm text-ink-subtle">Nothing here yet.</p>
      ) : (
        <div className="mt-0.5 flex flex-col">
          {visible.map((row) => (
            <div key={row.key} className="flex items-center gap-3 py-2">
              {row.image ? (
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
                  <PhotoImage src={row.image} alt="" fill sizes="56px" className="object-cover" />
                </div>
              ) : (
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-surface-brand text-brand">
                  <IconComponent iconName="Wallet02Icon" size={24} color="currentColor" />
                </span>
              )}

              <div className="min-w-0 flex-1">
                <div className="line-clamp-2 text-[14.5px] font-semibold leading-[1.35] text-gray-900">
                  {row.title}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-13 text-ink-muted">
                  <span>{moment(row.date).format('D MMM')}</span>
                  <span aria-hidden="true">·</span>
                  <span>{row.via}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-gray-900">{row.amount}</span>
                </div>
              </div>

              <span
                role="img"
                aria-label={row.direction === 'in' ? 'Money in' : 'Money out'}
                className={cn(
                  'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
                  row.direction === 'in' ? 'bg-surface-brand text-brand' : 'bg-danger-surface text-danger',
                )}
              >
                <IconComponent
                  iconName={row.direction === 'in' ? 'ArrowDown01Icon' : 'ArrowUpRight01Icon'}
                  size={18}
                  color="currentColor"
                />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
