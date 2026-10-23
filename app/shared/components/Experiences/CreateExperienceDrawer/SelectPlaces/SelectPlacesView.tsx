'use client';

import { useEffect, useMemo, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { SelectField } from '@/app/shared/components/Forms';
import {
  useGoogleMapsAutocomplete,
  usePlaceCategories,
  usePlaces,
} from '@/app/shared/hooks/usePlaces';
import type { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';
import type { Place } from '@/types/place';
import type { PlaceCategory } from '@/types/placeCategory';

import { PlaceCard } from './PlaceCard';

export interface PlaceSelection {
  id: string;
  name: string;
  imageUrl: string | null;
  city: string | null;
  locationId?: string | null;
  // Tukai places submit as place_id; Google picks as google_map_place_id
  source: 'tukai' | 'google';
}

interface SelectPlacesViewProps {
  /** false = single-pick (tap confirms immediately); true = multi-select with a confirm footer */
  multiple: boolean;
  /** e.g. "For Day 1, Sat 24 Oct. 2 places selected." - caller decides the exact copy. */
  contextLabel: string;
  /** "Select places" or "Select the place". */
  headerTitle: string;
  alreadySelectedIds?: string[];
  onClose: () => void;
  onConfirm: (places: PlaceSelection[]) => void;
}

// Kenya only for now - other countries aren't modeled yet (no country
// selector data source, and `usePlaces` has no country param).
const COUNTRIES = [{ value: 'KE', label: 'Kenya' }];

// `usePlaces` has no server-side city param, so City only narrows whatever
// page of Tukai results already came back - a client-side filter, not a
// fresh query.
const CITIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Nanyuki', 'Naivasha', 'Diani', 'Eldoret'];

const DISC =
  'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface transition-colors';

const placeToSelection = (place: Place): PlaceSelection => ({
  id: place.id,
  name: place.title,
  imageUrl: place.photos?.[0]?.photo ?? null,
  city: place.location?.city ?? null,
  locationId: place.location?.id ?? null,
  source: 'tukai',
});

const predictionToSelection = (prediction: GoogleMapsAutocompletePrediction): PlaceSelection => ({
  id: prediction.place_id,
  name: prediction.structured_formatting?.main_text ?? prediction.description,
  imageUrl: null,
  city: prediction.structured_formatting?.secondary_text ?? null,
  locationId: null,
  source: 'google',
});

/**
 * The Select-places sub-view (tk-pick-head / tk-place-grid / tk-pick-google),
 * opened from About's "where it happens" (single-pick) and Itinerary's "Add
 * place" (multi-select, per day). Fully self-contained: it owns its own
 * header, filters, grid, Google Maps fallback and (in multi-select mode)
 * confirm footer, and reports back only through `onConfirm` / `onClose`.
 *
 * Selection state is keyed by place id -> full `PlaceSelection`. Entries for
 * `alreadySelectedIds` are lazily filled in with full data the moment a
 * matching place is seen in the fetched grid (see the effect below), so a
 * place passed in only by id still toggles off correctly and still comes
 * back with full details if it stays selected through to `onConfirm`.
 */
export const SelectPlacesView = ({
  multiple,
  contextLabel,
  headerTitle,
  alreadySelectedIds = [],
  onClose,
  onConfirm,
}: SelectPlacesViewProps) => {
  const [country, setCountry] = useState('KE');
  const [city, setCity] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  // Seeded with placeholder (empty-name) entries for `alreadySelectedIds` so
  // those cards render as selected immediately, before their place data has
  // loaded - the effect below upgrades each to full data once it is found in
  // the fetched grid.
  const [selected, setSelected] = useState<Record<string, PlaceSelection>>(() =>
    Object.fromEntries(
      alreadySelectedIds.map((id) => [
        id,
        { id, name: '', imageUrl: null, city: null, source: 'tukai' as const },
      ]),
    ),
  );

  const { data: categoriesResponse } = usePlaceCategories({ pageSize: 100 }, true);
  const categories: PlaceCategory[] = categoriesResponse?.data?.results ?? [];

  const { data: placesResponse, isLoading: isPlacesLoading } = usePlaces({
    categoryId: categoryId || undefined,
    page: 1,
    enabled: true,
    search: search || undefined,
  });

  const allPlaces: Place[] = useMemo(() => placesResponse?.data?.results ?? [], [placesResponse]);
  const places = useMemo(
    () =>
      city
        ? allPlaces.filter((place) => place.location?.city?.toLowerCase() === city.toLowerCase())
        : allPlaces,
    [allPlaces, city],
  );

  // Upgrade any placeholder (empty-name) selection to full data once its
  // place turns up in the fetched grid.
  useEffect(() => {
    if (places.length === 0) return;
    setSelected((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const place of places) {
        if (next[place.id] && !next[place.id].name) {
          next[place.id] = placeToSelection(place);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [places]);

  const isSelected = (id: string) => Boolean(selected[id]);

  const showGoogleFallback = !isPlacesLoading && places.length === 0 && search.trim().length >= 2;
  const { data: googleResponse, isLoading: isLoadingGoogle } = useGoogleMapsAutocomplete(
    search,
    showGoogleFallback,
  );
  const googlePredictions: GoogleMapsAutocompletePrediction[] = Array.isArray(googleResponse?.data)
    ? googleResponse.data
    : [];

  const confirmAndClose = (places: PlaceSelection[]) => {
    onConfirm(places);
    onClose();
  };

  const toggleSelection = (id: string, selection: PlaceSelection) => {
    if (!multiple) {
      confirmAndClose([selection]);
      return;
    }

    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = selection;
      }
      return next;
    });
  };

  const togglePlace = (place: Place) => toggleSelection(place.id, placeToSelection(place));
  const toggleGoogle = (prediction: GoogleMapsAutocompletePrediction) =>
    toggleSelection(prediction.place_id, predictionToSelection(prediction));

  const selectedPlaces = Object.values(selected);
  const selectedCount = selectedPlaces.length;

  const actionLabels = multiple
    ? { default: 'Add', selected: 'Added' }
    : { default: 'Select', selected: 'Selected' };

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 flex flex-col gap-5">
        <div className="sticky top-0 z-[3] -mx-6 -mt-5 flex flex-col gap-4 bg-white px-6 pt-5 pb-3.5 shadow-[0_1px_0_#EDF0EE]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 flex-1 truncate text-22 font-bold tracking-[-0.4px] text-gray-800">
              {headerTitle}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`${DISC} text-danger hover:bg-danger-surface`}
            >
              <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
            </button>
          </div>

          <p className="m-0 text-15 leading-relaxed text-ink">{contextLabel}</p>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2.5">
              <SelectField label="Country" value={country} onChange={setCountry} options={COUNTRIES} />
              <SelectField
                label="City"
                value={city}
                onChange={setCity}
                options={CITIES.map((name) => ({ value: name, label: name }))}
                placeholder="All cities"
              />
            </div>

            <span className="relative block">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Find a place"
                placeholder="Find a place"
                className="h-14 w-full rounded-xl border border-line bg-white pl-[52px] pr-4 text-15 text-gray-800 outline-none focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]"
              />
              <IconComponent
                iconName="Search01Icon"
                size={20}
                color="#5B6B66"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
              />
            </span>
          </div>

          <div
            className="-mx-6 flex gap-2 overflow-x-auto px-6 scrollbar-hide"
            role="group"
            aria-label="Place categories"
          >
            <button
              type="button"
              aria-pressed={categoryId === null}
              onClick={() => setCategoryId(null)}
              className={`inline-flex h-11 flex-shrink-0 items-center whitespace-nowrap rounded-full px-[18px] text-[14.5px] font-medium ${
                categoryId === null
                  ? 'bg-surface-pill-active text-brand-deep'
                  : 'bg-surface text-gray-800'
              }`}
            >
              All
            </button>
            {categories.map((category) => {
              const isActive = categoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setCategoryId(category.id)}
                  className={`inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full pl-3.5 pr-[18px] text-[14.5px] font-medium ${
                    isActive ? 'bg-surface-pill-active text-brand-deep' : 'bg-surface text-gray-800'
                  }`}
                >
                  {category.icon && (
                    <IconComponent
                      iconName={category.icon}
                      size={19}
                      color={isActive ? '#066349' : '#5B6B66'}
                      variant={isActive ? 'bulk' : 'twotone'}
                    />
                  )}
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {isPlacesLoading ? (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        ) : places.length > 0 ? (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                isSelected={isSelected(place.id)}
                onToggle={() => togglePlace(place)}
                actionLabels={actionLabels}
              />
            ))}
          </div>
        ) : showGoogleFallback ? (
          <div className="flex flex-col gap-2.5">
            <p className="m-0 text-[13.5px] text-ink-muted">No Tukai places found</p>

            {isLoadingGoogle ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-[60px] animate-pulse rounded-xl bg-surface" />
                ))}
              </div>
            ) : googlePredictions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {googlePredictions.map((prediction) => {
                  const selectedGoogle = isSelected(prediction.place_id);
                  return (
                    <div
                      key={prediction.place_id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-line bg-white px-4 py-3"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-surface-brand text-brand">
                          <IconComponent iconName="Location01Icon" size={18} color="currentColor" />
                        </span>
                        <span className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {prediction.structured_formatting?.main_text ?? prediction.description}
                          </p>
                          {prediction.structured_formatting?.secondary_text && (
                            <p className="truncate text-xs text-ink-muted">
                              {prediction.structured_formatting.secondary_text}
                            </p>
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleGoogle(prediction)}
                        className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                          selectedGoogle
                            ? 'bg-brand-ink text-white'
                            : 'border border-line text-brand-ink hover:bg-surface-brand'
                        }`}
                      >
                        <IconComponent
                          iconName={selectedGoogle ? 'Tick02Icon' : 'AddCircleIcon'}
                          size={14}
                          color="currentColor"
                        />
                        {selectedGoogle ? actionLabels.selected : actionLabels.default}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl bg-surface px-5 py-7 text-center text-15 leading-relaxed text-ink">
                No places found for &ldquo;{search}&rdquo;.
              </p>
            )}

            <p className="m-0 self-end text-xs text-ink-muted">Powered by Google</p>
          </div>
        ) : (
          <p className="rounded-xl bg-surface px-5 py-7 text-center text-15 leading-relaxed text-ink">
            No places match. Try another category or search.
          </p>
        )}
      </div>

      {multiple && (
        <footer className="sticky bottom-0 -mx-6 -mb-9 mt-5 flex min-h-[88px] items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
          <button
            type="button"
            onClick={onClose}
            className="h-12 px-1.5 text-base font-medium text-danger hover:underline"
          >
            Cancel
          </button>

          <span className="flex-1" aria-hidden="true" />

          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={() => confirmAndClose(selectedPlaces)}
            className="h-12 flex-shrink-0 rounded-full bg-lime px-6 text-15 font-semibold text-brand-ink hover:shadow-[0_6px_16px_rgba(176,232,0,.4)] disabled:bg-[#E4F4B5] disabled:text-[#5E7A45] disabled:shadow-none"
          >
            {selectedCount > 0 ? `Add selected places (${selectedCount})` : 'Add selected places'}
          </button>
        </footer>
      )}
    </div>
  );
};
