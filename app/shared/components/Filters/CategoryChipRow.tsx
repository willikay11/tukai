'use client';

import { useEffect } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useRailPaging } from '@/app/shared/components/Lists/useRailPaging';
import { cn } from '@/lib/utils';

export interface CategoryChip {
  value: string;
  label: string;
  /** A Hugeicons name. Outlined when the chip is off, filled when it is on. */
  icon?: string;
}

/**
 * The category filter over the experiences listing: one chip per category,
 * one selected at a time. The arrows only appear when the chips overflow, and
 * each one goes once its end of the row is reached.
 */
export const CategoryChipRow = ({
  chips,
  value,
  onChange,
}: {
  chips: CategoryChip[];
  value: string;
  onChange: (value: string) => void;
}) => {
  const { ref, atStart, atEnd, onBack, onNext, measure } = useRailPaging<HTMLDivElement>();

  // The chips arrive from the API after first paint, which resizes the row's
  // contents without resizing the row, so the ends are read again here
  useEffect(() => {
    measure();
  }, [chips, measure]);

  return (
    <div role="tablist" aria-label="Filter experiences by category" className="relative">
      <div
        ref={ref}
        className="flex gap-2.5 overflow-x-auto overscroll-x-contain py-0.5 scrollbar-hide"
      >
        {chips.map((chip) => {
          const isOn = chip.value === value;

          return (
            <button
              key={chip.value}
              type="button"
              role="tab"
              aria-selected={isOn}
              onClick={() => onChange(chip.value)}
              className={cn(
                'flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[13.5px] transition-colors',
                chip.icon && 'pl-3.5 pr-[18px]',
                isOn
                  ? 'bg-surface-brand font-semibold text-brand'
                  : 'bg-surface font-medium text-gray-900 hover:bg-surface-brand-hover',
              )}
            >
              {chip.icon && (
                <IconComponent
                  iconName={chip.icon}
                  variant={isOn ? 'solid' : 'twotone'}
                  size={20}
                  color="currentColor"
                  className="flex-shrink-0"
                />
              )}
              {chip.label}
            </button>
          );
        })}
      </div>

      {!atStart && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex w-24 items-center bg-gradient-to-r from-white from-50% to-transparent">
          <button
            type="button"
            onClick={onBack}
            aria-label="Scroll categories left"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-gray-900 shadow-md transition-colors hover:bg-surface"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={16} color="currentColor" />
          </button>
        </div>
      )}

      {!atEnd && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex w-24 items-center justify-end bg-gradient-to-l from-white from-50% to-transparent">
          <button
            type="button"
            onClick={onNext}
            aria-label="Scroll categories right"
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-gray-900 shadow-md transition-colors hover:bg-surface"
          >
            <IconComponent iconName="ArrowRight01Icon" size={16} color="currentColor" />
          </button>
        </div>
      )}
    </div>
  );
};
