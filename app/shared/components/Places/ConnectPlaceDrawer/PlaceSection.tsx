'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Place } from '@/types/place';

import { PlaceResultCard } from './PlaceResultCard';
import type { PlaceSource } from './useConnectPlaceDrawer';

const SOURCE_OPTIONS: { value: PlaceSource; label: string; note?: string }[] = [
  { value: 'existing', label: 'Already on Tukai' },
  { value: 'new', label: 'New place', note: '(not on Tukai)' },
];

export interface PlaceSectionProps {
  source: PlaceSource;
  onSourceChange: (source: PlaceSource) => void;
  query: string;
  onQueryChange: (value: string) => void;
  debouncedQuery: string;
  searchResults: Place[];
  isSearchingPlaces: boolean;
  connectedPlaces: Place[];
  onToggleConnectedPlace: (place: Place) => void;
  onAddAsNewPlace: () => void;
  getLockReason: (placeId: string) => 'inClaim' | null;
}

/**
 * Already-on-Tukai search and connect grid, or the New place toggle. Several
 * places can go in one claim - one set of documents covers them all.
 */
export const PlaceSection = ({
  source,
  onSourceChange,
  query,
  onQueryChange,
  debouncedQuery,
  searchResults,
  isSearchingPlaces,
  connectedPlaces,
  onToggleConnectedPlace,
  onAddAsNewPlace,
  getLockReason,
}: PlaceSectionProps) => {
  const connectedIds = new Set(connectedPlaces.map((place) => place.id));
  // Connected places first, then up to 8 matches not already connected
  const unconnectedResults = searchResults.filter((place) => !connectedIds.has(place.id)).slice(0, 8);
  const cards = [...connectedPlaces, ...unconnectedResults];
  const hasSearched = debouncedQuery.length >= 2;
  const hasNoMatches = hasSearched && !isSearchingPlaces && unconnectedResults.length === 0 && connectedPlaces.length === 0;

  return (
    <section className="flex flex-col gap-3" aria-label="Existing or new place">
      <span className="text-[15px] font-semibold text-gray-800">
        Existing or new place{' '}
        <span className="text-[13.5px] font-normal text-ink-muted">
          (is the place already on Tukai?)
        </span>
      </span>

      <div role="radiogroup" aria-label="Existing or new place" className="flex flex-wrap gap-2">
        {SOURCE_OPTIONS.map((option) => {
          const checked = option.value === source;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onSourceChange(option.value)}
              className={cn(
                'inline-flex h-12 items-center gap-1 whitespace-nowrap rounded-full px-5 text-[14.5px] font-semibold transition-colors',
                checked
                  ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
                  : 'bg-surface text-gray-800',
              )}
            >
              {option.label}
              {option.note && (
                <span className={checked ? 'text-surface-brand' : 'text-ink-muted'}>
                  {option.note}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {source === 'existing' && (
        <div className="-mt-1 flex flex-col gap-3.5">
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by the name of the place"
            aria-label="Search by the name of the place"
            autoComplete="off"
            icon={<IconComponent iconName="Search01Icon" size={20} className="text-ink-muted" />}
            containerClassName="h-14 rounded-xl"
          />

          {cards.length > 0 && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-3.5 gap-y-[18px]">
              {cards.map((place) => (
                <PlaceResultCard
                  key={place.id}
                  place={place}
                  isConnected={connectedIds.has(place.id)}
                  lockReason={connectedIds.has(place.id) ? null : getLockReason(place.id)}
                  onToggle={onToggleConnectedPlace}
                />
              ))}
            </div>
          )}

          {hasNoMatches && (
            <div className="flex flex-wrap items-center gap-2.5 rounded-xl bg-surface px-3.5 py-3">
              <p className="min-w-[220px] flex-1 text-sm leading-relaxed text-gray-800">
                Nothing on Tukai matches &ldquo;{debouncedQuery}&rdquo;.
              </p>
              <button
                type="button"
                onClick={onAddAsNewPlace}
                className="inline-flex h-11 flex-shrink-0 items-center rounded-full bg-white px-4 text-sm font-semibold text-brand"
              >
                Add it as a new place
              </button>
            </div>
          )}

          {connectedPlaces.length >= 2 && (
            <p className="text-[13.5px] font-semibold text-brand">
              {connectedPlaces.length} places in this claim. One set of documents covers them all.
            </p>
          )}
        </div>
      )}
    </section>
  );
};
