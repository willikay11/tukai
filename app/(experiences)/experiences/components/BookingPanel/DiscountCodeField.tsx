'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type AppliedDiscount = {
  code: string;
  /** What comes off the order, in the order's own currency */
  amount: number;
  /** The API's own wording, where it gives one */
  description?: string;
};

/**
 * Applying a discount code, the way checkouts do it.
 *
 * A code is checked against the order before anything is paid, so an unusable
 * one is answered here rather than by the Pay button. Once applied it stops
 * being an editable field and becomes the applied row — the code is part of the
 * order at that point, and changing it means removing it first.
 */
export const DiscountCodeField = ({
  applied,
  isChecking,
  error,
  isDisabled,
  currency,
  onApply,
  onRemove,
}: {
  applied: AppliedDiscount | null;
  isChecking: boolean;
  error?: string;
  isDisabled?: boolean;
  currency: string;
  onApply: (code: string) => void;
  onRemove: () => void;
}) => {
  const [code, setCode] = useState('');

  if (applied) {
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-800">Discount Code</p>

        <div className="flex items-center gap-3 rounded-2xl border border-primary bg-green-50 p-3">
          <IconComponent
            iconName="CheckmarkBadge01Icon"
            size={18}
            color="currentColor"
            className="flex-shrink-0 text-primary"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{applied.code} applied</p>
            <p className="truncate text-xs text-gray-500">
              {applied.description ??
                `${currency} ${applied.amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} off this order`}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 text-xs font-medium text-gray-500 underline hover:text-gray-800"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-800">
        Discount Code{' '}
        <span className="font-normal text-gray-400">(Enter the discount code if you have any)</span>
      </p>

      <div className="flex items-start gap-2">
        <div className="flex-1">
          <Input
            value={code}
            aria-label="Discount Code"
            placeholder="Enter code"
            disabled={isDisabled || isChecking}
            // Codes are handled uppercase everywhere they are shown
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && code.trim()) {
                event.preventDefault();
                onApply(code.trim());
              }
            }}
            suffixIcon={<IconComponent iconName="Tag01Icon" size={18} className="text-gray-400" />}
          />
          {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>

        <Button
          type="button"
          variant="gradient-outline"
          isLoading={isChecking}
          disabled={isDisabled || !code.trim()}
          onClick={() => onApply(code.trim())}
          className="h-11 flex-shrink-0 rounded-full px-5 text-xs font-semibold"
        >
          Apply
        </Button>
      </div>
    </div>
  );
};
