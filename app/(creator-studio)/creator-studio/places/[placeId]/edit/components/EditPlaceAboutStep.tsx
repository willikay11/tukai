'use client';

import { useRef, useState } from 'react';

import { LocationAutocompleteField } from '@/app/shared/components/LocationPicker/LocationAutocompleteField';
import { useGoogleMapsAutocomplete } from '@/app/shared/hooks/usePlaces';
import { Editor } from '@/components/blocks/editor-00/editor';
import { Input } from '@/components/ui/input';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';

import { AboutStepValues, EditPhoto } from '../schemas';
import { PlacePhotoField } from './PlacePhotoField';

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
      <PlacePhotoField
        photos={values.photos}
        error={errors.photos}
        onChange={(photos: EditPhoto[]) => onChange({ photos })}
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
          placeholderClassName="text-sm"
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
        <label className="block text-xs font-medium text-gray-800">
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
    <label className="text-xs font-medium text-gray-800">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
