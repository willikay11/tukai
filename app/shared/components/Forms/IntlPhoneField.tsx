'use client';

import { useMemo, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DIAL_COUNTRIES, dialCountry } from '@/utils/dial-codes';

export interface IntlPhoneFieldProps {
  /** ISO country of the calling code, e.g. "KE" */
  country: string;
  onCountryChange: (iso: string) => void;
  /** The number as typed, without its calling code */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  'aria-label'?: string;
}

/**
 * A phone field for a number from any country: a calling-code picker (flag
 * and "+44", searchable) sits inside the field, ahead of the number - in the
 * spot where single-country fields show a fixed "+254".
 */
export const IntlPhoneField = ({
  country,
  onCountryChange,
  value,
  onChange,
  placeholder = 'Enter phone number',
  'aria-label': ariaLabel = 'Phone number',
}: IntlPhoneFieldProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = dialCountry(country) ?? dialCountry('KE')!;

  const matches = useMemo(() => {
    const search = query.trim().toLowerCase().replace(/^\+/, '');
    if (!search) return DIAL_COUNTRIES;
    return DIAL_COUNTRIES.filter(
      (entry) =>
        entry.name.toLowerCase().includes(search) ||
        entry.dialCode.startsWith(search) ||
        entry.iso.toLowerCase() === search,
    );
  }, [query]);

  const choose = (iso: string) => {
    onCountryChange(iso);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="flex h-14 w-full items-center rounded-xl border border-line bg-white focus-within:border-brand focus-within:shadow-[0_0_0_3px_#E8F1ED]">
      <Popover
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) setQuery('');
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Country code, ${current.name} +${current.dialCode}`}
            aria-expanded={open}
            className="flex h-full flex-none items-center gap-1.5 rounded-l-xl pl-4 pr-2.5 outline-none focus-visible:bg-surface"
          >
            <span aria-hidden="true" className="text-[18px] leading-none">
              {current.flag}
            </span>
            <span className="text-15 font-semibold text-gray-800">+{current.dialCode}</span>
            <IconComponent
              iconName="ArrowDown01Icon"
              size={16}
              color="#5B6B66"
              className={cn('transition-transform', open && 'rotate-180')}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-[min(320px,calc(100vw-32px))] rounded-[18px] p-1.5 shadow-[0_0_0_1px_rgba(1,51,52,.06),0_14px_36px_rgba(1,51,52,.16)]"
        >
          <input
            autoFocus
            type="search"
            aria-label="Search countries"
            placeholder="Search country or code"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && matches[0]) {
                event.preventDefault();
                choose(matches[0].iso);
              }
            }}
            className="mb-1.5 h-11 w-full rounded-xl border border-line px-3 text-15 text-gray-800 outline-none focus:border-brand"
          />
          <div role="listbox" aria-label="Country codes" className="max-h-[260px] overflow-y-auto">
            {matches.length === 0 ? (
              <p className="px-3 py-2.5 text-sm text-ink-muted">No country matches that.</p>
            ) : (
              matches.map((entry) => {
                const isSelected = entry.iso === current.iso;
                return (
                  <button
                    key={entry.iso}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => choose(entry.iso)}
                    className={cn(
                      'flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-15 text-gray-800 outline-none',
                      'hover:bg-surface focus:shadow-[inset_0_0_0_2px_#066349]',
                      isSelected && 'bg-surface-brand font-semibold text-brand-ink',
                    )}
                  >
                    <span aria-hidden="true" className="text-[18px] leading-none">
                      {entry.flag}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                    <span className="text-ink-muted">+{entry.dialCode}</span>
                  </button>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
      <span aria-hidden="true" className="h-5 border-r border-line" />
      <input
        type="tel"
        inputMode="tel"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d\s-]/g, '').slice(0, 18))}
        className="h-full min-w-0 flex-1 rounded-r-xl bg-transparent px-3 text-15 text-gray-800 outline-none placeholder:text-ink-muted"
      />
    </div>
  );
};
