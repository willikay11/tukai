'use client';

import { SORT_OPTIONS } from '@/app/shared/components/Filters/sort';
import { IconComponent } from '@/app/shared/components/Icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SortOption } from '@/types/search';

/**
 * How the results are ordered.
 *
 * `value` is already the *effective* pick (see `effectiveSort` in
 * `Filters/sort.ts`) - a choice the current tab doesn't offer still lives in
 * the URL, but this always shows and applies Recommended in that case, same
 * as the design keeps it. `options` is the list to offer, in menu order.
 *
 * Built on `DropdownMenu` rather than `Popover`: a radio menu needs arrow-key
 * roving focus, Enter/Space to pick, and Escape returning focus to the
 * trigger, which the dropdown-menu primitive gives for free and a popover
 * does not.
 *
 * ⚠️ The design asks for the current option focused on open; this primitive
 * only exposes that entry point on its base `Menu`, not on `DropdownMenu`
 * (`onOpenAutoFocus`/`onEntryFocus` are both omitted from its public props),
 * so opening the menu focuses the first offered option instead. Still fully
 * keyboard-operable - arrow keys move from there same as anywhere else.
 */
export const SortMenu = ({
  value,
  options,
  onChange,
}: {
  value: SortOption;
  options: SortOption[];
  onChange: (next: SortOption) => void;
}) => {
  const current = SORT_OPTIONS.find((option) => option.value === value);
  const offered = SORT_OPTIONS.filter((option) => options.includes(option.value));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Sort by"
        className="inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-surface px-3.5 text-[13.5px] font-semibold text-brand-ink outline-none transition-colors hover:bg-[#EDEFEC] data-[state=open]:bg-[#EDEFEC]"
      >
        <IconComponent iconName="Sorting01Icon" size={17} color="currentColor" />
        {current?.label ?? 'Recommended'}
        <IconComponent
          iconName="ArrowDown01Icon"
          size={14}
          color="currentColor"
          className="text-ink-muted"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[232px] rounded-[18px] border-line-soft p-1.5"
      >
        <DropdownMenuLabel className="px-3 pb-1 pt-2 text-[12.5px] font-semibold text-ink-muted">
          Sort by
        </DropdownMenuLabel>

        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(next) => onChange(next as SortOption)}
        >
          {offered.map((option) => {
            const isCurrent = option.value === value;

            return (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center justify-between gap-2.5 rounded-xl px-3 text-[14px] font-semibold outline-none transition-colors hover:bg-[rgba(1,51,52,.05)]',
                  isCurrent ? 'bg-surface-brand text-brand' : 'text-ink-label',
                )}
              >
                <span>{option.label}</span>
                <DropdownMenuItemIndicator>
                  <IconComponent iconName="Tick02Icon" size={16} color="currentColor" />
                </DropdownMenuItemIndicator>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
