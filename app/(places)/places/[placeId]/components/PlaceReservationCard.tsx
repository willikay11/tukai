'use client';

import moment from 'moment';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlaceBookingRequest } from '@/types/placeReservation';

// A reservation is a Purchase, so it carries the same lifecycle a ticket does.
// The reader needs to know whether the venue has actually said yes.
//
// Declined, cancelled and expired all mean the same thing to the reader —
// there is no table — so they share one treatment.
const NO_TABLE = 'bg-red-100 text-red-600';

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  requested: { label: 'Awaiting confirmation', className: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-700' },
  declined: { label: 'Declined', className: NO_TABLE },
  cancelled: { label: 'Cancelled', className: NO_TABLE },
  expired: { label: 'Expired', className: NO_TABLE },
};

const CANCELLABLE = new Set(['requested', 'accepted', 'pending']);

export const PlaceReservationCard = ({
  reservation,
  placeName,
  onCancel,
  isCancelling,
}: {
  reservation: PlaceBookingRequest;
  placeName: string;
  onCancel: () => void;
  isCancelling: boolean;
}) => {
  const start = reservation.occurrence?.startDate ? moment(reservation.occurrence.startDate) : null;
  const partySize = reservation.restaurantDetail?.partySize;
  const status = STATUS_STYLE[reservation.status] ?? {
    label: reservation.status,
    className: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="flex items-start gap-3">
        {start?.isValid() && (
          <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-gray-50">
            <span className="text-[10px] font-semibold uppercase text-gray-400">
              {start.format('MMM')}
            </span>
            <span className="text-sm font-bold text-gray-900">{start.format('D')}</span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">{placeName}</p>
          <p className="mt-0.5 truncate text-sm text-gray-500">
            {[
              partySize ? `${partySize} Pax` : null,
              start?.isValid() ? start.format('h:mm A') : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <span
            className={cn(
              'mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
              status.className,
            )}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* ⚠️ No edit endpoint exists — the API offers accept/decline/pay/cancel
          only, so a change means cancelling and requesting again. */}
      {CANCELLABLE.has(reservation.status) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isCancelling}
          className="mt-3 h-auto p-0 text-sm font-medium text-red-500 hover:bg-transparent hover:text-red-600"
        >
          {isCancelling ? 'Cancelling…' : 'Cancel Reservation'}
        </Button>
      )}
    </div>
  );
};
