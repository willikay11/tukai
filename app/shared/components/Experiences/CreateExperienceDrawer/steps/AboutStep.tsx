'use client';

import { useId, useState } from 'react';

import type { useCreateExperienceFlow } from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
import { PhotoField, RichTextField, TimeField } from '@/app/shared/components/Forms';
import { IconComponent } from '@/app/shared/components/Icons';
import { useGetInterestCategories } from '@/app/shared/hooks/useAuth';
import { useDeleteExperiencePhoto } from '@/app/shared/hooks/useExperiences';
import { useGoogleMapsAutocomplete, usePlaces } from '@/app/shared/hooks/usePlaces';
import type { GoogleMapsAutocompletePrediction } from '@/types/googleMaps';
import type { Interest } from '@/types/interest';
import type { Place } from '@/types/place';

type Flow = ReturnType<typeof useCreateExperienceFlow>;

interface AboutStepProps {
  flow: Flow;
  /** "Browse places on Tukai" opens the shared Select-places sub-view (single pick); the result lands back here reactively via flow.formData.about. */
  onRequestWherePlace: () => void;
}

const uuid = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tmp-${Date.now()}-${Math.random()}`);

/**
 * A Tukai-then-Google place combobox (tk-combo). Used for "Where will the
 * experience take place?" (both sources + a "Browse places on Tukai" link to
 * the full Select-places view) and "Meeting details" (Google only).
 */
const PlaceCombobox = ({
  placeholder,
  googleOnly,
  onPickTukai,
  onPickGoogle,
  onRequestBrowse,
  error,
}: {
  placeholder: string;
  googleOnly?: boolean;
  onPickTukai?: (place: Place) => void;
  onPickGoogle: (prediction: GoogleMapsAutocompletePrediction) => void;
  onRequestBrowse?: () => void;
  error?: string;
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const listId = useId();

  const { data: placesResponse } = usePlaces({
    page: 1,
    enabled: !googleOnly && query.trim().length > 1,
    search: query,
  });
  const tukaiPlaces: Place[] = (!googleOnly && placesResponse?.data?.results) || [];

  const showGoogle = googleOnly || (query.trim().length > 1 && tukaiPlaces.length === 0);
  const { data: googleResponse } = useGoogleMapsAutocomplete(query, showGoogle && query.trim().length > 1);
  const googlePredictions: GoogleMapsAutocompletePrediction[] = Array.isArray(googleResponse?.data)
    ? googleResponse.data
    : [];

  return (
    <div className="relative flex flex-col gap-1.5">
      <span className="relative block">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 150)}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          autoComplete="off"
          className="h-14 w-full rounded-xl border border-line bg-white pl-4 pr-12 text-15 text-gray-800 outline-none focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]"
        />
        <IconComponent
          iconName={googleOnly ? 'Search01Icon' : 'Location01Icon'}
          size={20}
          color="#5B6B66"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
        />
      </span>

      {isOpen && query.trim().length > 1 && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 top-[62px] z-30 flex max-h-[420px] flex-col gap-0.5 overflow-y-auto rounded-[14px] bg-white p-1.5 shadow-[0_0_0_1px_rgba(1,51,52,.06),0_14px_36px_rgba(1,51,52,.16)]"
        >
          {!googleOnly && (
            <>
              <span className="px-2.5 pb-1 pt-2 text-[12.5px] font-semibold text-ink-muted">
                On Tukai
              </span>
              {tukaiPlaces.length > 0 ? (
                tukaiPlaces.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onPickTukai?.(place);
                      setQuery(place.title);
                      setIsOpen(false);
                    }}
                    className="flex min-h-14 items-center gap-3 rounded-[10px] px-2.5 text-left hover:bg-surface"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={place.photos?.[0]?.photo}
                      alt=""
                      className="h-10 w-10 flex-shrink-0 rounded-lg bg-surface-brand object-cover"
                    />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-[14.5px] font-semibold text-gray-800">
                        {place.title}
                      </span>
                      <span className="truncate text-13 text-ink-muted">
                        {[place.categories?.[0]?.name, place.location?.city].filter(Boolean).join(' · ')}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-2.5 py-2 text-14 leading-relaxed text-ink-muted">
                  No places on Tukai match &ldquo;{query}&rdquo;.
                </p>
              )}
              {onRequestBrowse && (
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setIsOpen(false);
                    onRequestBrowse();
                  }}
                  className="mt-1 flex min-h-[52px] items-center gap-3 rounded-[10px] px-2.5 text-left hover:bg-surface"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface-brand text-brand">
                    <IconComponent iconName="Location01Icon" size={18} color="currentColor" />
                  </span>
                  <span className="text-[14.5px] font-semibold text-brand">
                    Not on Tukai? Select it from Google Maps
                  </span>
                </button>
              )}
            </>
          )}

          {showGoogle && (
            <>
              <span className="mt-1 border-t border-surface-muted px-2.5 pb-1 pt-2.5 text-[12.5px] font-semibold text-ink-muted">
                From Google Maps
              </span>
              {googlePredictions.length > 0 ? (
                googlePredictions.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onPickGoogle(prediction);
                      setQuery(prediction.structured_formatting?.main_text ?? prediction.description);
                      setIsOpen(false);
                    }}
                    className="flex min-h-14 items-center gap-3 rounded-[10px] px-2.5 text-left hover:bg-surface"
                  >
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface text-ink-muted">
                      <IconComponent iconName="Location01Icon" size={18} color="currentColor" />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-[14.5px] font-semibold text-gray-800">
                        {prediction.structured_formatting?.main_text ?? prediction.description}
                      </span>
                      {prediction.structured_formatting?.secondary_text && (
                        <span className="truncate text-13 text-ink-muted">
                          {prediction.structured_formatting.secondary_text}
                        </span>
                      )}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-2.5 py-2 text-14 leading-relaxed text-ink-muted">
                  No places found on Google Maps. Try a landmark, building or street name.
                </p>
              )}
              <span className="self-end px-2.5 pb-0.5 pt-1 text-xs text-ink-muted">Powered by Google</span>
            </>
          )}
        </div>
      )}

      {error && <span className="text-[13.5px] leading-tight text-danger-deep">{error}</span>}
    </div>
  );
};

/**
 * Step 2: About (tk-field / tk-combo in create-experience.css). Poster
 * photos, title, description/included/not-included, where it happens,
 * optional meeting details, and categories.
 *
 * Photo add/remove follows the same pattern as the old
 * `AboutStep`/`PhotoUploader`: adds are purely local (`FormPhoto` with a
 * `file` reference, no API call yet) - the actual upload happens inside
 * `handleSaveAbout` when the step saves. Removing an already-uploaded photo
 * (no local `file`) calls the delete API immediately, since there is
 * nothing to "undo" locally for a photo that already exists on the server.
 */
export const AboutStep = ({ flow, onRequestWherePlace }: AboutStepProps) => {
  const { about: formData } = flow.formData;
  const errors = flow.aboutErrors;
  const update = flow.updateAboutFormData;

  const { mutate: deleteExperiencePhoto } = useDeleteExperiencePhoto();
  const { data: categories = [] } = useGetInterestCategories();

  const handleAddPhotos = (files: File[]) => {
    const next = files.map((file) => ({
      id: uuid(),
      url: URL.createObjectURL(file),
      file,
      isTempId: true,
    }));
    update({ photos: [...formData.photos, ...next] });
  };

  const handleRemovePhoto = (id: string) => {
    const photo = formData.photos.find((p) => p.id === id);
    if (photo && !photo.file) deleteExperiencePhoto(id);
    update({ photos: formData.photos.filter((p) => p.id !== id) });
  };

  const handleReorderPhotos = (fromIndex: number, toIndex: number) => {
    const next = [...formData.photos];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    update({ photos: next });
  };

  const handleMovePhoto = (id: string, direction: -1 | 1) => {
    const index = formData.photos.findIndex((p) => p.id === id);
    if (index === -1) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= formData.photos.length) return;
    handleReorderPhotos(index, nextIndex);
  };

  const toggleCategory = (category: Interest) => {
    const isSelected = formData.categories.some((c) => c.id === category.id);
    update({
      categories: isSelected
        ? formData.categories.filter((c) => c.id !== category.id)
        : [...formData.categories, category],
    });
  };

  const isPlacePicked = Boolean(formData.location);

  return (
    <div className="flex flex-col gap-7">
      <h2 className="text-22 font-bold leading-tight tracking-[-0.3px] text-gray-800">
        Add details about the experience
      </h2>

      <PhotoField
        label={
          <>
            Upload an experience poster{' '}
            <span className="font-normal text-ink-muted">(540 × 540 px, up to 15 MB)</span>
          </>
        }
        photos={formData.photos}
        onAdd={handleAddPhotos}
        onRemove={handleRemovePhoto}
        onReorder={handleReorderPhotos}
        onMove={handleMovePhoto}
      />
      {errors.photos && <span className="text-[13.5px] text-danger-deep">{errors.photos}</span>}

      <label className="flex flex-col gap-2">
        <span className="text-15 font-semibold text-gray-800">Title of your experience</span>
        <input
          value={formData.title}
          onChange={(event) => update({ title: event.target.value })}
          placeholder="Enter the experience title"
          className="h-14 w-full rounded-xl border border-line bg-white px-4 text-15 text-gray-800 outline-none focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]"
        />
        {errors.title && <span className="text-[13.5px] text-danger-deep">{errors.title}</span>}
      </label>

      <div className="flex flex-col gap-2.5">
        <RichTextField
          label="Add your experience description"
          value={formData.description}
          onChange={(value) => update({ description: value })}
          placeholder="Grab people's attention with a detailed description of the experience"
          minHeight={120}
          error={errors.description}
        />
        <RichTextField
          label="What's included"
          value={formData.whatsIncluded}
          onChange={(value) => update({ whatsIncluded: value })}
          placeholder="One item per line"
          minHeight={96}
        />
        <RichTextField
          label="What's not included"
          value={formData.whatsNotIncluded}
          onChange={(value) => update({ whatsNotIncluded: value })}
          placeholder="One item per line"
          minHeight={96}
        />
      </div>

      <div className="-mx-6 h-px bg-gray-200" aria-hidden="true" />

      <div className="flex flex-col gap-2">
        <span className="text-15 font-semibold text-gray-800">
          Where will the experience take place?
        </span>

        {isPlacePicked ? (
          <div className="flex items-center gap-3.5 rounded-xl bg-surface p-2.5">
            {formData.placeImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.placeImageUrl}
                alt=""
                className="h-14 w-14 flex-shrink-0 rounded-[10px] object-cover"
              />
            ) : (
              <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[10px] bg-white text-brand">
                <IconComponent iconName="Location01Icon" size={24} color="currentColor" />
              </span>
            )}
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-15 font-semibold text-gray-800">{formData.location}</span>
            </span>
            <button
              type="button"
              onClick={onRequestWherePlace}
              className="h-11 flex-shrink-0 rounded-full px-3.5 text-15 font-semibold text-brand hover:bg-surface-brand"
            >
              Change
            </button>
            <button
              type="button"
              aria-label="Remove place"
              onClick={() =>
                update({ location: '', locationPlaceId: '', placeId: null, placeImageUrl: null })
              }
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface-brand"
            >
              <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
            </button>
          </div>
        ) : (
          <>
            <PlaceCombobox
              placeholder="Search by place name or area"
              onPickTukai={(place) =>
                update({
                  location: place.title,
                  locationPlaceId: '',
                  placeId: place.id,
                  placeImageUrl: place.photos?.[0]?.photo ?? null,
                })
              }
              onPickGoogle={(prediction) =>
                update({
                  location: prediction.structured_formatting?.main_text ?? prediction.description,
                  locationPlaceId: prediction.place_id,
                  placeId: null,
                  placeImageUrl: null,
                })
              }
              onRequestBrowse={onRequestWherePlace}
              error={errors.location}
            />
            <button
              type="button"
              onClick={onRequestWherePlace}
              className="inline-flex min-h-11 items-center gap-2 self-start text-[14.5px] font-semibold text-brand hover:underline"
            >
              <IconComponent iconName="Building03Icon" size={20} color="#066349" />
              Browse places on Tukai
            </button>
          </>
        )}

        {formData.locationPlaceId && (
          <span className="flex items-start gap-2 text-[13.5px] leading-relaxed text-ink-muted">
            <IconComponent
              iconName="InformationCircleIcon"
              size={17}
              color="#066349"
              className="mt-px flex-shrink-0"
            />
            From Google Maps. It becomes a new place on Tukai when you publish, so people can find
            this experience there.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-15 font-semibold text-gray-800">
          Meeting details <span className="font-normal text-ink-muted">(optional)</span>
        </span>
        <PlaceCombobox
          placeholder="Search Google Maps for a meeting point"
          googleOnly
          onPickGoogle={(prediction) =>
            update({ meetingPoint: prediction.structured_formatting?.main_text ?? prediction.description })
          }
        />
        <TimeField
          label="Meeting time"
          value={formData.meetingTime}
          onChange={(value) => update({ meetingTime: value })}
        />
      </div>

      <div className="-mx-6 h-px bg-gray-200" aria-hidden="true" />

      <div className="flex flex-col gap-3">
        <span className="text-15 font-semibold text-gray-800">
          Select the categories the experience falls under
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
          {categories.map((category: Interest) => {
            const isSelected = formData.categories.some((c) => c.id === category.id);
            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleCategory(category)}
                className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-[18px] text-[14.5px] font-medium ${
                  isSelected ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white' : 'bg-surface text-gray-800'
                }`}
              >
                {category.icon && (
                  <IconComponent
                    iconName={category.icon}
                    size={20}
                    color="currentColor"
                    variant={isSelected ? 'bulk' : 'twotone'}
                  />
                )}
                {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
