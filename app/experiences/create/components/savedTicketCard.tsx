'use client';

import { IconComponent } from '@/app/components/iconComponent';

const currencyFormatter = new Intl.NumberFormat('en-KE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatKsh(value: number) {
  return `Ksh ${currencyFormatter.format(Number.isFinite(value) ? value : 0)}`;
}

export interface SavedTicketCardProps {
  name: string;
  quantity: number;
  amount: number;
  validity: string;
  coverPhoto?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export default function SavedTicketCard({
  name,
  quantity,
  amount,
  validity,
  coverPhoto,
  onEdit,
  onDelete,
  isDeleting = false,
}: SavedTicketCardProps) {
  return (
    <div className="relative rounded-[12px] border border-dashed border-primary bg-emerald-50 p-2">
      {/* Top notch */}
      <div className="absolute -top-[1px] left-[102px] h-1.5 w-3 -translate-x-1/2 rounded-b-full border border-t-0 border-dashed border-primary bg-white" />
      {/* Bottom notch */}
      <div className="absolute -bottom-[1px] left-[102px] h-1.5 w-3 -translate-x-1/2 rounded-t-full border border-b-0 border-dashed border-primary bg-white" />

      <div className="flex items-center gap-3">
        <img
          src={coverPhoto}
          alt={name}
          className="h-20 w-20 flex-shrink-0 rounded-[12px] object-cover"
        />

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
                    <IconComponent iconName="Delete02Icon" size={16} color="#EF4444" />
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-6 gap-2">
            <div className="col-span-1">
              <p className="text-xs text-gray-500">Qty</p>
              <p className="text-xs font-semibold text-gray-800">{quantity}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-xs font-semibold text-gray-800">{formatKsh(amount)}</p>
            </div>
            <div className="col-span-3">
              <p className="text-xs text-gray-500">Validity</p>
              <p className="truncate text-xs font-semibold text-gray-800">{validity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
