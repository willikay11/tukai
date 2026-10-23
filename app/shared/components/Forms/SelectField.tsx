'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface SelectFieldOption {
  value: string;
  label: string;
  icon?: string;
}

export interface SelectFieldProps {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  options: SelectFieldOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  leftIcon?: string;
}

/**
 * The canvas's plain Select field (tk-fieldbtn + tk-select): a button with a
 * floating label once a value is chosen, opening a popover list below it.
 * Used for single-choice dropdowns like country, bank or currency - the
 * payout-method and currency *pills* in the handoff use tk-payout-opt /
 * tk-type-opt instead, not this component.
 */
export const SelectField = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  disabled,
  className,
  leftIcon,
}: SelectFieldProps) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-expanded={open}
            className={cn(
              'flex h-14 w-full items-center gap-3 rounded-xl border border-line bg-white px-4 text-left outline-none',
              'focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]',
              open && 'border-brand shadow-[0_0_0_3px_#E8F1ED]',
              error && 'border-danger-deep',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {leftIcon && (
              <IconComponent iconName={leftIcon} size={20} color="#5B6B66" className="flex-shrink-0" />
            )}
            <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              {selected ? (
                <>
                  <span className="text-[12.5px] leading-tight text-ink-muted">{label}</span>
                  <span className="truncate text-15 leading-tight text-gray-800">
                    {selected.label}
                  </span>
                </>
              ) : (
                <span className="truncate text-15 leading-tight text-ink-muted">
                  {placeholder ?? label}
                </span>
              )}
            </span>
            <IconComponent
              iconName="ArrowDown01Icon"
              size={18}
              color="#5B6B66"
              className={cn('flex-shrink-0 transition-transform', open && 'rotate-180')}
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[--radix-popover-trigger-width] min-w-[240px] max-h-[320px] overflow-y-auto rounded-[18px] p-1.5 shadow-[0_0_0_1px_rgba(1,51,52,.06),0_14px_36px_rgba(1,51,52,.16)]"
        >
          <div className="flex flex-col gap-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-left text-15 text-gray-800 outline-none',
                    'hover:bg-surface focus:shadow-[inset_0_0_0_2px_#066349]',
                    isSelected && 'bg-surface-brand font-semibold text-brand-ink',
                  )}
                >
                  {option.icon && (
                    <IconComponent
                      iconName={option.icon}
                      size={18}
                      color="currentColor"
                      className="flex-shrink-0"
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {isSelected && (
                    <IconComponent
                      iconName="Tick02Icon"
                      size={18}
                      color="#066349"
                      className="flex-shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {error && <span className="text-[13.5px] leading-tight text-danger-deep">{error}</span>}
    </div>
  );
};
