'use client';

import { useMemo, useState } from 'react';

import {
  PaymentStatusBadge,
  StatusConfig,
} from '@/app/(experiences)/experiences/components/PaymentStatusBadge';
import { IconComponent } from '@/app/shared/components/Icons';
import { useExperienceTicketPurchases } from '@/app/shared/hooks/useExperiences';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoData } from '@/components/ui/noData';
import { TicketPurchase } from '@/types/ticket-purchase';

import { ManageExperienceMetrics } from '../../utils/manage-metrics';

interface SalesTabProps {
  experienceId: string;
  currency: string;
  metrics: ManageExperienceMetrics;
}

// A completed purchase is settled in full. There is no partial-payment field on
// the purchase record, so "Partially Paid" cannot be represented — see the
// filter comment below.
// Overrides the badge's default map entirely, so every status the list can show
// has to be listed here or it falls back to a neutral grey badge
const SALES_STATUS_CONFIG: Record<string, StatusConfig> = {
  completed: { label: 'Fully Paid', dot: 'bg-primary', text: 'text-primary' },
  pending: { label: 'Pending', dot: 'bg-yellow-500', text: 'text-yellow-600' },
  failed: { label: 'Failed', dot: 'bg-red-500', text: 'text-red-600' },
  expired: { label: 'Expired', dot: 'bg-gray-400', text: 'text-gray-500' },
};

type SalesFilter = 'all' | 'completed';

interface BuyerRow {
  key: string;
  name: string;
  picture?: string | null;
  ticketCount: number;
  amount: number;
  status: string;
}

const buildBuyerRows = (purchases: TicketPurchase[]): BuyerRow[] => {
  // One purchase record per ticket, so buyers are grouped by user + status
  const grouped = new Map<string, BuyerRow>();

  purchases.forEach((purchase) => {
    const name =
      purchase.user?.displayName ||
      [purchase.user?.firstName, purchase.user?.lastName].filter(Boolean).join(' ') ||
      'Guest';
    const key = `${purchase.user?.id ?? name}-${purchase.status}`;
    const price = parseFloat(purchase.ticket?.price ?? '0') || 0;

    const existing = grouped.get(key);
    if (existing) {
      existing.ticketCount += 1;
      existing.amount += price;
      return;
    }

    grouped.set(key, {
      key,
      name,
      picture: purchase.user?.picture,
      ticketCount: 1,
      amount: price,
      status: purchase.status,
    });
  });

  return Array.from(grouped.values());
};

export const SalesTab = ({ experienceId, currency, metrics }: SalesTabProps) => {
  const [filter, setFilter] = useState<SalesFilter>('all');
  const [search, setSearch] = useState('');

  const { data: purchasesResponse, isLoading } = useExperienceTicketPurchases(experienceId);
  const purchases: TicketPurchase[] = purchasesResponse?.data?.results ?? [];

  const buyers = useMemo(() => buildBuyerRows(purchases), [purchases]);

  const visibleBuyers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return buyers.filter((buyer) => {
      const matchesFilter = filter === 'all' || buyer.status === filter;
      const matchesSearch = !query || buyer.name.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [buyers, filter, search]);

  // Only filters the API can actually answer. A "Partially Paid" pill would
  // never match: the purchase record has no partial-payment field.
  const filters: Array<{ id: SalesFilter; label: string; count: number }> = [
    { id: 'all', label: 'All', count: buyers.length },
    {
      id: 'completed',
      label: 'Fully Paid',
      count: buyers.filter((buyer) => buyer.status === 'completed').length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-3xl bg-primary p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">Current Ticket Sales</p>
            <p className="mt-1 text-3xl font-bold text-white">
              {currency} {metrics.revenue.toLocaleString()}
            </p>
          </div>

          <Button
            type="button"
            variant="lime"
            disabled
            title="Payouts are not available yet"
            className="flex-shrink-0 rounded-full px-5"
          >
            Withdraw
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-white/60">Tickets Sold</p>
            <p className="mt-0.5 text-lg font-bold text-white">{metrics.ticketsSold}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">Total buyers</p>
            <p className="mt-0.5 text-lg font-bold text-white">{metrics.buyers}</p>
          </div>
          <div>
            <p className="text-xs text-white/60">Pending Payments</p>
            <p className="mt-0.5 text-lg font-bold text-lime">
              {currency} {metrics.pendingPayments.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filters.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filter === option.id
                  ? 'bg-lime/20 text-primary'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search buyers"
            aria-label="Search buyers"
            className="rounded-full"
            icon={
              <IconComponent
                iconName="Search01Icon"
                size={16}
                color="currentColor"
                className="text-gray-400"
              />
            }
          />
        </div>
      </div>

      {/* Buyer list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : visibleBuyers.length === 0 ? (
        <div className="py-10">
          <NoData message="No ticket sales yet" />
        </div>
      ) : (
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
          {visibleBuyers.map((buyer) => (
            <div key={buyer.key} className="flex items-center gap-3 px-4 py-3">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={buyer.picture ?? undefined} />
                <AvatarFallback>{buyer.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{buyer.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {currency} {buyer.amount.toLocaleString()} · {buyer.ticketCount}{' '}
                  {buyer.ticketCount === 1 ? 'ticket' : 'tickets'}
                </p>
              </div>

              <PaymentStatusBadge status={buyer.status} config={SALES_STATUS_CONFIG} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
