'use client';

import { useRef, useState } from 'react';

import { LocationAutocompleteField } from '@/app/shared/components/LocationPicker/LocationAutocompleteField';
import { PhotoUploader } from '@/app/shared/components/PhotoUploader';
import { useGoogleMapsAutocomplete } from '@/app/shared/hooks/usePlaces';
import { Editor } from '@/components/blocks/editor-00/editor';
import { Input } from '@/components/ui/input';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';

import { AboutStepValues, EditPhoto } from '../schemas';

const ENTRY_OPTIONS = [
  { value: 'free', label: 'Free Entry' },
  { value: 'paid', label: 'Paid Entry' },
];

export const EditPlaceAboutStep = ({
  values,
  errors,
  onChange,
}: {
  values: AboutStepValues;
  errors: Record<string, string>;
  onChange: (patch: Partial<AboutStepValues>) => void;
}) => {
  const addressRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: suggestions, isFetching } = useGoogleMapsAutocomplete(
    values.address,
    showSuggestions && values.address.length >= 3,
  );

  return (
    <div className="space-y-6">
      {/* The same uploader the create-experience flow writes photos with.
          Reordering is off: the API sets a place photo's order and cover as it
          is created and offers no way to move either afterwards, so a drag here
          would not survive the save. */}
      <PhotoUploader
        photos={values.photos}
        error={errors.photos}
        label={
          <>
            Upload a few photos of the place{' '}
            <span className="text-muted-foreground">(Dimensions: 540*540, Max 10 MB)</span>
          </>
        }
        hint={null}
        maxPhotos={15}
        sortable={false}
        shape="square"
        // Removals are applied by Save changes, along with everything else, so
        // taking a photo off the grid must not delete it there and then
        onDeleteExisting={async () => undefined}
        onPhotoChange={() => undefined}
        onPhotoFilesChange={(photos: EditPhoto[]) => onChange({ photos })}
      />

      <Field label="Name" error={errors.title}>
        <Input
          value={values.title}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="The name people will search for"
          aria-label="Name"
        />
      </Field>

      <Field label="Description" error={errors.description}>
        {/* The stored value is HTML, and the editor is what round-trips it —
            the same one the create-experience flow writes descriptions in */}
        <Editor
          initialHtml={values.description}
          onHtmlChange={(description) => onChange({ description })}
        />
      </Field>

      <Field label="Place" error={errors.address || errors.googleMapPlaceId}>
        <LocationAutocompleteField
          containerRef={addressRef}
          value={values.address}
          placeholder="Select a city or place"
          showSuggestions={showSuggestions}
          suggestions={suggestions?.data ?? []}
          isLoading={isFetching}
          onFocus={() => setShowSuggestions(true)}
          // Typing past a chosen suggestion drops the id with it: the API keys
          // the location off the id, so a hand-typed address cannot stand in
          onValueChange={(address) => onChange({ address, googleMapPlaceId: '' })}
          onSelectSuggestion={(prediction) => {
            setShowSuggestions(false);
            onChange({ address: prediction.description, googleMapPlaceId: prediction.place_id });
          }}
        />
      </Field>

      <div className="space-y-2">
        {/* Block, or the inline label and the inline-flex pills share a line */}
        <label className="block text-sm font-medium text-gray-800">
          Is entry to your business free or paid?
        </label>
        <PillRadioGroup
          options={ENTRY_OPTIONS}
          value={values.entry}
          onChange={(entry) => onChange({ entry: entry as AboutStepValues['entry'] })}
        />
      </div>
    </div>
  );
};

// Labelled as every field in the create-experience wizard is
const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-800">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
