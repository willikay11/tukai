'use client';

import { useEffect, useRef, useState } from 'react';

import { FileUploadField } from '@/app/shared/components/Forms/FileUploadField';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { LocationAutocompleteField } from '@/app/shared/components/LocationPicker/LocationAutocompleteField';
import { SectionShell } from '@/app/shared/components/Sections';
import { useGoogleMapsAutocomplete, usePlaces } from '@/app/shared/hooks/usePlaces';
import { Input } from '@/components/ui/input';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Place } from '@/types/place';

export type NewPlaceDraft = {
  title: string;
  description: string;
  address: string;
  googleMapPlaceId: string;
  photos: File[];
};

export type PlaceSource = 'existing' | 'new';

const SOURCE_OPTIONS = [
  { value: 'existing', label: 'Already on Tukai' },
  { value: 'new', label: 'New place' },
];

export const ClaimPlaceSection = ({
  source,
  selectedPlace,
  newPlace,
  onSourceChange,
  onSelectPlace,
  onNewPlaceChange,
}: {
  source: PlaceSource;
  selectedPlace: Place | null;
  newPlace: NewPlaceDraft;
  onSourceChange: (source: PlaceSource) => void;
  onSelectPlace: (place: Place | null) => void;
  onNewPlaceChange: (draft: NewPlaceDraft) => void;
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const addressRef = useRef<HTMLDivElement>(null);

  // Typing a name should not fire a request per keystroke
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: placesResponse, isFetching } = usePlaces({
    page: 1,
    search: debouncedQuery,
    enabled: source === 'existing' && debouncedQuery.length >= 2,
  });
  const results: Place[] = placesResponse?.data?.results ?? [];

  const { data: addressSuggestions, isFetching: isFetchingAddresses } = useGoogleMapsAutocomplete(
    newPlace.address,
    source === 'new' && newPlace.address.length >= 3,
  );

  return (
    <SectionShell
      id="claim-place"
      title="Which place are you claiming?"
      subtitle="Find it on Tukai, or add it if it isn't listed yet."
    >
      <PillRadioGroup
        options={SOURCE_OPTIONS}
        value={source}
        onChange={(value) => onSourceChange(value as PlaceSource)}
      />

      {source === 'existing' ? (
        <div className="mt-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name e.g. Talisman"
            aria-label="Search places by name"
            icon={<IconComponent iconName="Search01Icon" size={18} className="text-gray-400" />}
          />

          {selectedPlace && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary bg-green-50 p-3">
              <PlaceThumbnail place={selectedPlace} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {selectedPlace.title}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {selectedPlace.location?.city ?? 'Location not set'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectPlace(null)}
                className="text-sm font-medium text-gray-500 hover:text-gray-800"
              >
                Change
              </button>
            </div>
          )}

          {!selectedPlace && debouncedQuery.length >= 2 && (
            <div className="mt-4 space-y-2">
              {isFetching && <p className="text-sm text-gray-400">Searching places...</p>}

              {!isFetching && results.length === 0 && (
                <p className="text-sm text-gray-400">
                  No place matches “{debouncedQuery}”. Add it as a new place instead.
                </p>
              )}

              {results.map((place) => (
                <div
                  key={place.id}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3"
                >
                  <PlaceThumbnail place={place} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{place.title}</p>
                    <p className="truncate text-xs text-gray-500">
                      {place.location?.city ?? 'Location not set'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectPlace(place)}
                    className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-medium text-white"
                  >
                    <IconComponent iconName="PlusSignIcon" size={14} color="currentColor" />
                    Connect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <Field label="Place name">
            <Input
              value={newPlace.title}
              onChange={(event) => onNewPlaceChange({ ...newPlace, title: event.target.value })}
              placeholder="e.g. Talisman Restaurant"
              aria-label="Place name"
            />
          </Field>

          <Field label="Address">
            <LocationAutocompleteField
              containerRef={addressRef}
              value={newPlace.address}
              placeholder="Search the address on Google Maps"
              showSuggestions={showAddressSuggestions}
              suggestions={addressSuggestions?.data ?? []}
              isLoading={isFetchingAddresses}
              onFocus={() => setShowAddressSuggestions(true)}
              onValueChange={(value) =>
                onNewPlaceChange({ ...newPlace, address: value, googleMapPlaceId: '' })
              }
              onSelectSuggestion={(prediction) => {
                setShowAddressSuggestions(false);
                onNewPlaceChange({
                  ...newPlace,
                  address: prediction.description,
                  googleMapPlaceId: prediction.place_id,
                });
              }}
            />
          </Field>

          <Field label="Description">
            <Textarea
              value={newPlace.description}
              onChange={(event) =>
                onNewPlaceChange({ ...newPlace, description: event.target.value })
              }
              placeholder="Tell people what this place is"
              aria-label="Description"
              rows={4}
            />
          </Field>

          {/* The API will not create a place without at least one photo */}
          <FileUploadField
            id="new-place-photos"
            label="Photos"
            buttonText="Add Photo(s)"
            multiple
            maxFiles={5}
            onFilesChange={(photos) => onNewPlaceChange({ ...newPlace, photos })}
          />
        </div>
      )}
    </SectionShell>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="mb-1.5 text-sm font-medium text-gray-800">{label}</p>
    {children}
  </div>
);

const PlaceThumbnail = ({ place }: { place: Place }) => (
  <div className={cn('relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100')}>
    <PhotoImage
      src={place.photos?.find((photo) => photo.isCover)?.photo ?? place.photos?.[0]?.photo}
      alt={place.title}
      fill
      className="object-cover"
      fallbackIconSize={18}
    />
  </div>
);
