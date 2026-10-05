'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

import { FilterChip } from './filters';

/**
 * The bar that sits under the header once a search is on.
 *
 * Sticky, as the canvas has it: the chips are how a reader knows what they
 * narrowed by, so they have to stay in view while the results scroll.
 */
export const ResultsFilterBar = ({
  chips,
  onEdit,
  onRemove,
  onClearAll,
  sortLabel,
  onToggleSort,
}: {
  chips: FilterChip[];
  onEdit: () => void;
  onRemove: (chip: FilterChip) => void;
  onClearAll: () => void;
  sortLabel: string;
  onToggleSort: () => void;
}) => (
  <div className="sticky top-16 z-20 -mx-6 mt-1.5 flex items-center gap-3 bg-white px-6 py-2.5">
    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scrollbar-hide">
      <button
        type="button"
        onClick={onEdit}
        aria-haspopup="dialog"
        className="inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-brand-ink py-0 pl-3.5 pr-3 text-[13.5px] font-semibold text-white transition-transform hover:bg-[#02494A] active:scale-[0.98]"
      >
        <IconComponent iconName="FilterHorizontalIcon" size={17} color="currentColor" />
        Edit filters
        {chips.length > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1.5 text-[11px] font-bold text-brand-ink">
            {chips.length}
          </span>
        )}
      </button>

      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onRemove(chip)}
          aria-label={`Remove ${chip.label}`}
          className="inline-flex h-11 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-surface-brand py-0 pl-4 pr-3 text-[13.5px] font-semibold text-brand transition-transform hover:brightness-[0.96] active:scale-[0.98]"
        >
          {chip.label}
          <IconComponent iconName="Cancel01Icon" size={15} color="currentColor" />
        </button>
      ))}

      {chips.length > 0 && (
        <button
          type="button"
          onClick={onClearAll}
          className="h-11 flex-shrink-0 whitespace-nowrap rounded-full px-2.5 text-[13.5px] font-semibold text-[#FE4A49] transition-colors hover:bg-danger-surface"
        >
          Clear all
        </button>
      )}
    </div>

    {/* Places are the only thing the API can rank, so this is theirs */}
    <button
      type="button"
      onClick={onToggleSort}
      className={cn(
        'inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-[13.5px] font-semibold transition-colors',
        'bg-surface text-brand-ink hover:brightness-[0.97]',
      )}
    >
      <IconComponent iconName="ArrowUpDownIcon" size={17} color="currentColor" />
      {sortLabel}
    </button>
  </div>
);
