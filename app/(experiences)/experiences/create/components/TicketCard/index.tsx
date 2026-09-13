'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';

const currencyFormatter = new Intl.NumberFormat('en-KE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatKsh(value: number) {
  return `Ksh ${currencyFormatter.format(Number.isFinite(value) ? value : 0)}`;
}

export interface TicketCardProps {
  name: string;
  quantity: number;
  // The host's base amount, as typed into the ticket form
  amount: number;
  // What the buyer is charged, straight from the API's buyer_price. Null until
  // the ticket has been saved and the API has allocated the commission.
  buyerPrice?: number | null;
  validity: string;
  coverPhoto?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  commissionPayer?: 'host' | 'customer' | 'split';
}

function getCommissionPercentage(commissionPayer?: 'host' | 'customer' | 'split'): number {
  if (!commissionPayer) return 0;
  return commissionPayer === 'host' ? 0 : commissionPayer === 'customer' ? 4 : 2;
}

export const TicketCard = ({
  name,
  quantity,
  amount,
  buyerPrice = null,
  validity,
  coverPhoto,
  onEdit,
  onDelete,
  isDeleting = false,
  commissionPayer,
}: TicketCardProps) => {
  const commissionPercentage = getCommissionPercentage(commissionPayer);
  const customerPrice = amount + (amount * commissionPercentage) / 100;
  // The API's buyer price already has the commission allocated, so it is both
  // the price to show and the reason the estimated note below is redundant
  const displayPrice = buyerPrice ?? amount;
  const showCommissionNote = buyerPrice === null && commissionPercentage > 0;

  return (
    <div className="relative rounded-[12px] border border-dashed border-primary bg-emerald-50 p-2">
      {/* Top notch */}
      <div className="absolute -top-[1px] left-[102px] h-1.5 w-3 -translate-x-1/2 rounded-b-full border border-t-0 border-dashed border-primary bg-white" />
      {/* Bottom notch */}
      <div className="absolute -bottom-[1px] left-[102px] h-1.5 w-3 -translate-x-1/2 rounded-t-full border border-b-0 border-dashed border-primary bg-white" />

      <div className="flex items-center gap-3">
        {coverPhoto && (
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[12px]">
            <PhotoImage src={coverPhoto} alt={name} fill sizes="80px" className="object-cover" />
          </div>
        )}

        <div className="h-16 border-l border-dashed border-primary" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-gray-800">{name}</p>
            </div>

            <div className="flex items-center gap-3">
              {onEdit && (
                <button type="button" onClick={onEdit} className="text-primary">
                  <IconComponent iconName="Edit02Icon" size={16} color="#047857" />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="text-red-500 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <IconComponent
                      iconName="Loading03Icon"
                      size={16}
                      color="#EF4444"
                      className="animate-spin"
                    />
                  ) : (
                    <IconComponent iconName="Delete04Icon" size={16} color="#EF4444" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-1 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-gray-500">Qty</p>
                <p className="text-xs font-semibold text-gray-800">{quantity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Price</p>
                <p className="text-xs font-semibold text-gray-800">{formatKsh(displayPrice)}</p>
              </div>
              {showCommissionNote && (
                <div>
                  <p className="text-xs text-gray-500">Customer Pays</p>
                  <p className="text-xs font-semibold text-emerald-600">
                    {formatKsh(customerPrice)}
                  </p>
                </div>
              )}
            </div>
            {/*
              Hidden alongside the Ticket Sales Validity section in TicketForm —
              with no sales window captured this only ever reads "Not set".

            <div>
              <p className="text-xs text-gray-500">Validity</p>
              <p className="truncate text-xs font-semibold text-gray-800">{validity}</p>
            </div>
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SavedTicketCard = TicketCard;
export type SavedTicketCardProps = TicketCardProps;
