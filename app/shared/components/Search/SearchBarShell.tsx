'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { CityPicker } from './CityPicker';

/**
 * The canvas's search bar: city, query, filters and the search itself in one
 * pill.
 *
 * The city used to sit beside the bar as its own chip and the filters lived
 * inside the results popover. The canvas puts all four in a row, which is why
 * this is a shell the search owns rather than four components in a header.
 *
 * 54px on a desktop and 50px on a phone, where the Filters label drops to its
 * icon - both the canvas's own numbers.
 */
export const SearchBarShell = ({
  cityLabel,
  pinOn,
  away,
  homeCity,
  onGoHome,
  onFilters,
  filterCount = 0,
  isFilterOpen = false,
  canSearch,
  onSearch,
  children,
}: {
  cityLabel: string;
  /** The pin takes the brand green while away from home, or with location on. */
  pinOn: boolean;
  /** Another city, with location off - the chip turns green with a way back. */
  away: boolean;
  homeCity: string;
  onGoHome: () => void;
  onFilters: () => void;
  filterCount?: number;
  isFilterOpen?: boolean;
  /** The search button is dead until there is something to search for. */
  canSearch: boolean;
  onSearch: () => void;
  /** The query field, which the search owns. */
  children: React.ReactNode;
}) => {
  const [isCityOpen, setIsCityOpen] = useState(false);

  return (
    // `mx-auto` rather than leaving it to the row: the popover anchor around
    // this is full width, so centring the row centres a box that already fills
    // it and leaves the bar at its left edge
    <div className="mx-auto flex h-[50px] w-full max-w-[600px] items-center rounded-full border border-line-soft bg-white pl-5 pr-[5px] shadow-[0_1px_8px_rgba(1,51,52,.06)] min-[720px]:h-[54px]">
      <Popover open={isCityOpen} onOpenChange={setIsCityOpen}>
        {/* Tagged so the "Exploring" bar's own Change city button, on Discover,
        can reach this same popover - it is not the chip's own child. */}
        <span
          data-city-root=""
          className={cn(
            '-ml-[15px] flex flex-shrink-0 items-center rounded-full transition-colors duration-150',
            away ? 'bg-surface-brand' : 'bg-transparent',
          )}
        >
          <PopoverTrigger
            aria-label="Choose a location"
            className={cn(
              'flex h-11 flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full pl-[15px] pr-3 text-[13.5px] font-semibold outline-none transition-colors hover:bg-[rgba(1,51,52,0.06)]',
              away ? 'text-brand' : 'text-brand-ink',
            )}
          >
            <IconComponent
              iconName="Location01Icon"
              size={17}
              color="currentColor"
              className={pinOn ? 'text-brand' : 'text-ink-muted'}
            />
            {cityLabel}
            {/* Shown at home, and with location on - away drops it for the
            home button instead */}
            {!away && (
              <IconComponent
                iconName="ArrowDown01Icon"
                size={14}
                color="currentColor"
                className="text-ink-muted"
              />
            )}
          </PopoverTrigger>

          {away && (
            <button
              type="button"
              onClick={onGoHome}
              aria-label={`Back to ${homeCity}`}
              title={`Back to ${homeCity}`}
              className="-ml-3 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-brand transition-colors hover:bg-[rgba(1,51,52,0.08)]"
            >
              <IconComponent iconName="Cancel01Icon" size={16} color="currentColor" />
            </button>
          )}
        </span>

        <PopoverContent
          align="start"
          sideOffset={14}
          collisionPadding={16}
          className="w-auto rounded-[18px] border-line-soft p-0"
        >
          <CityPicker onClose={() => setIsCityOpen(false)} />
        </PopoverContent>
      </Popover>

      <span aria-hidden="true" className="ml-1 mr-3.5 h-6 w-px flex-shrink-0 bg-surface-muted" />

      {children}

      <span aria-hidden="true" className="ml-2.5 h-6 w-px flex-shrink-0 bg-surface-muted" />

      <button
        type="button"
        onClick={onFilters}
        aria-label="Filters"
        aria-haspopup="dialog"
        aria-expanded={isFilterOpen}
        className={cn(
          'ml-1 flex h-11 flex-shrink-0 items-center gap-[7px] whitespace-nowrap rounded-full px-3 text-[13.5px] font-semibold transition-colors hover:bg-surface',
          filterCount > 0 ? 'bg-surface-brand text-brand' : 'text-brand-ink',
          isFilterOpen && 'bg-surface',
        )}
      >
        <IconComponent iconName="FilterHorizontalIcon" size={17} color="currentColor" />
        <span className="hidden min-[720px]:inline">Filters</span>
        {filterCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1.5 text-[11px] font-bold text-brand-ink">
            {filterCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={onSearch}
        disabled={!canSearch}
        aria-label="Search"
        className={cn(
          'ml-1 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-transform active:scale-[0.96]',
          canSearch
            ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
            : 'cursor-not-allowed bg-surface-muted text-ink-subtle',
        )}
      >
        <IconComponent iconName="Search01Icon" size={20} color="currentColor" />
      </button>
    </div>
  );
};
