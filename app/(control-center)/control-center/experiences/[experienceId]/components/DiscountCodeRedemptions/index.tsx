'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { PromoCode, promoCodeValueLabel, redemptionsRemaining } from '@/types/promoCode';

interface DiscountCodeRedemptionsProps {
  code: PromoCode | null;
  currency: string;
  onClose: () => void;
}

type Row = { label: string; value: string; hint?: string };

/**
 * What the API can say about one code's use.
 *
 * Every figure here comes off the code record itself. `GET
 * promo-codes/{id}/redemptions/` exists and would give the individual
 * purchases, but the schema declares it returning the code serializer — plainly
 * the generator copying the viewset's own — so the real shape of a row is
 * unknown, and a list built on a guess would break on first contact. The
 * per-purchase list is left for when that response can be seen.
 */
export const redemptionRows = (code: PromoCode, currency: string): Row[] => {
  const redeemed = code.redeemedCount ?? 0;
  const remaining = redemptionsRemaining(code);
  const rows: Row[] = [
    { label: 'Redeemed', value: `${redeemed} ${redeemed === 1 ? 'time' : 'times'}` },
    { label: 'Discount', value: promoCodeValueLabel(code, currency) },
    { label: 'Status', value: code.isActive ? 'Live' : 'Paused' },
  ];

  rows.push(
    remaining === null
      ? {
          label: 'Redemption limit',
          value: 'No limit',
          hint: 'This code can be used any number of times.',
        }
      : {
          label: 'Uses left',
          value: String(remaining),
          hint: `Of the ${code.maxRedemptions} this code allows.`,
        },
  );

  if (code.maxRedemptionsPerUser) {
    rows.push({
      label: 'Per person',
      value: `${code.maxRedemptionsPerUser} ${code.maxRedemptionsPerUser === 1 ? 'use' : 'uses'}`,
    });
  }

  if (code.minTickets) {
    rows.push({
      label: 'Minimum tickets',
      value: `${code.minTickets} ${code.minTickets === 1 ? 'ticket' : 'tickets'}`,
    });
  }

  if (code.minOrderAmount && Number(code.minOrderAmount) > 0) {
    rows.push({
      label: 'Minimum order',
      value: `${currency} ${Number(code.minOrderAmount).toLocaleString('en-US')}`,
    });
  }

  if (code.startsAt || code.endsAt) {
    const from = code.startsAt ? moment(code.startsAt).format('D MMM YYYY') : 'now';
    const until = code.endsAt ? moment(code.endsAt).format('D MMM YYYY') : 'no end date';
    rows.push({ label: 'Can be used', value: `${from} — ${until}` });
  }

  if (code.dateCreated) {
    rows.push({ label: 'Created', value: moment(code.dateCreated).format('D MMM YYYY') });
  }

  return rows;
};

export const DiscountCodeRedemptions = ({
  code,
  currency,
  onClose,
}: DiscountCodeRedemptionsProps) => (
  <Drawer isOpen={Boolean(code)} setIsOpen={(open) => !open && onClose()} width="narrow">
    {code && (
      <div className="flex min-h-full flex-col">
        <div className="flex items-center gap-3 border-b border-line px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-brand"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
          </button>
          <h2 className="text-19 font-bold tracking-tight text-gray-900">Redemptions</h2>
        </div>

        <div className="flex flex-1 flex-col gap-5 px-6 py-6">
          <div className="flex items-center gap-3">
            <IconComponent
              iconName="DiscountTag02Icon"
              size={24}
              color="currentColor"
              className={cn('flex-shrink-0', code.isActive ? 'text-brand' : 'text-ink-subtle')}
            />
            <h3 className="min-w-0 flex-1 break-words text-xl font-bold tracking-wide text-gray-900">
              {code.code}
            </h3>
          </div>

          {(code.redeemedCount ?? 0) === 0 && (
            <p className="rounded-14 bg-surface px-4 py-3 text-15 text-ink-muted">
              No one has used this code yet.
            </p>
          )}

          <dl className="flex flex-col gap-0.5 overflow-hidden rounded-14">
            {redemptionRows(code, currency).map((row) => (
              <div key={row.label} className="flex flex-col gap-1 bg-surface px-4 py-3">
                <dt className="text-13 text-ink-muted">{row.label}</dt>
                <dd className="text-base font-semibold text-gray-900">{row.value}</dd>
                {row.hint && <p className="text-13 text-ink-subtle">{row.hint}</p>}
              </div>
            ))}
          </dl>

          {/* Said plainly rather than left as a blank space a host reads as a bug */}
          <p className="text-13 leading-relaxed text-ink-subtle">
            Who used this code, and when, is not available yet.
          </p>
        </div>
      </div>
    )}
  </Drawer>
);
