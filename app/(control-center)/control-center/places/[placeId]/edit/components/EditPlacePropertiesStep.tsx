'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneNumber } from '@/components/ui/phoneNumber';

import {
  CONTACT_KEYS,
  PropertyGroup,
  groupsForCategories,
  joinValues,
  splitValues,
} from '../propertyCatalogue';
import { PropertyValue } from '../schemas';
import { HoursValue, PlaceHoursFields, formatOpenHours, parseOpenHours } from './PlaceHoursFields';
import { PropertyPillGroup } from './PropertyPillGroup';

const newId = (key: string) => `new-${key.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

/**
 * The details a place carries, offered as the pills its categories call for.
 *
 * Every field here writes into the same `properties` list the step is given —
 * a pill group is one property whose value is its selected labels joined with
 * ", ", and contact and hours are properties too. Nothing has its own store, so
 * the save diff stays exactly as it was.
 */
export const EditPlacePropertiesStep = ({
  categoryNames,
  properties,
  errors,
  onChange,
}: {
  categoryNames: string[];
  properties: PropertyValue[];
  errors: Record<string, string>;
  onChange: (properties: PropertyValue[]) => void;
}) => {
  const groups = groupsForCategories(categoryNames);
  const offeredKeys = new Set<string>([
    ...groups.map((group) => group.key),
    ...Object.values(CONTACT_KEYS),
  ]);

  const valueFor = (key: string) =>
    properties.find((property) => property.key.trim() === key)?.value ?? '';

  // One property per key: written where it exists, appended where it does not,
  // and dropped once it is emptied so a cleared pill group is not saved as ''
  const writeValue = (key: string, value: string, icon?: string) => {
    const existing = properties.find((property) => property.key.trim() === key);

    if (!existing) {
      if (!value) return;
      onChange([...properties, { id: newId(key), key, value, icon }]);
      return;
    }

    onChange(
      value
        ? properties.map((property) =>
            property.id === existing.id ? { ...property, value } : property,
          )
        : properties.filter((property) => property.id !== existing.id),
    );
  };

  // Whatever the place already holds that no group above offers. Kept editable
  // rather than hidden — a place in a category this catalogue has no pills for
  // would otherwise lose everything it has on the first save.
  const otherProperties = properties.filter(
    (property) => !offeredKeys.has(property.key.trim()) || !property.key.trim(),
  );

  const storedHours = valueFor(CONTACT_KEYS.hours);
  const parsedHours = parseOpenHours(storedHours);

  // Held here rather than derived from the property: hours only compose into a
  // value once days and both times are set, so a part-made selection would have
  // nowhere to live and the pills would never light up
  const [hours, setHours] = useState<HoursValue>(
    () => parsedHours ?? { days: [], opensAt: '', closesAt: '' },
  );

  const handleHoursChange = (next: HoursValue) => {
    const composed = formatOpenHours(next);
    const previous = formatOpenHours(hours);

    setHours(next);

    // Nothing composed yet and nothing composed before means the reader is
    // still building the first one — writing '' here would delete hours this
    // field could not read back
    if (composed || previous) writeValue(CONTACT_KEYS.hours, composed, 'Clock01Icon');
  };

  const updateOther = (id: string, patch: Partial<PropertyValue>) =>
    onChange(
      properties.map((property) => (property.id === id ? { ...property, ...patch } : property)),
    );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Select the properties to add to your business
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          {categoryNames.length > 0
            ? `The list below comes from this place's categories: ${categoryNames.join(', ')}.`
            : 'This place has no categories yet, so there are no suggested properties.'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800">Phone Number</p>
          <PhoneNumber
            initialValue={valueFor(CONTACT_KEYS.phone)}
            aria-label="Phone Number"
            placeholder="721920820"
            onChange={(phone) =>
              // The picker reports the dialling code even when nothing was
              // typed, which is not a phone number
              writeValue(CONTACT_KEYS.phone, /\d{6,}/.test(phone) ? phone : '', 'Call02Icon')
            }
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-800">Email</p>
          <Input
            type="email"
            aria-label="Email"
            placeholder="Enter email address"
            value={valueFor(CONTACT_KEYS.email)}
            onChange={(event) =>
              writeValue(CONTACT_KEYS.email, event.target.value.trim(), 'Mail01Icon')
            }
          />
        </div>
      </div>

      <Divider />

      {/* Hours the place keeps, composed into the one value it is stored as */}
      <PlaceHoursFields value={hours} onChange={handleHoursChange} />

      {/* A value this field cannot read back is left exactly as it is, rather
          than half-parsed into the pickers above and rewritten on save */}
      {storedHours && !parsedHours && (
        <p className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-600">
          <span className="font-semibold text-gray-900">Currently saved: </span>
          {storedHours}. Choosing days and times above replaces it.
        </p>
      )}

      {groups.map((group: PropertyGroup) => (
        <div key={group.key} className="space-y-8">
          <Divider />
          <PropertyPillGroup
            label={group.key}
            options={group.options}
            selected={splitValues(valueFor(group.key))}
            onChange={(selected) => writeValue(group.key, joinValues(selected), group.icon)}
          />
        </div>
      ))}

      <Divider />

      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-800">
          Other details{' '}
          <span className="text-muted-foreground">
            (Anything the list above doesn&apos;t cover)
          </span>
        </p>

        <ul className="space-y-3">
          {otherProperties.map((property) => {
            const index = properties.indexOf(property);

            return (
              <li key={property.id} className="rounded-2xl bg-gray-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <Input
                      value={property.key}
                      onChange={(event) => updateOther(property.id, { key: event.target.value })}
                      placeholder="Detail e.g. Parking"
                      aria-label={`Detail ${index + 1} name`}
                    />
                    {errors[`properties.${index}.key`] && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors[`properties.${index}.key`]}
                      </p>
                    )}
                  </div>

                  <div className="flex-1">
                    <Input
                      value={property.value}
                      onChange={(event) => updateOther(property.id, { value: event.target.value })}
                      placeholder="Value e.g. Free on site"
                      aria-label={`Detail ${index + 1} value`}
                    />
                    {errors[`properties.${index}.value`] && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors[`properties.${index}.value`]}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onChange(properties.filter((entry) => entry.id !== property.id))}
                    aria-label={`Remove ${property.key || `detail ${index + 1}`}`}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center self-end rounded-full text-gray-400 transition hover:bg-white hover:text-destructive sm:self-start"
                  >
                    <IconComponent iconName="Delete02Icon" color="currentColor" size={18} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <Button
          type="button"
          variant="ghost"
          className="h-auto p-0 text-xs font-semibold text-primary hover:bg-transparent hover:text-primary/80"
          onClick={() => onChange([...properties, { id: newId('detail'), key: '', value: '' }])}
        >
          <span className="flex items-center gap-1.5">
            <IconComponent iconName="PlusSignIcon" color="currentColor" size={16} />
            Add
          </span>
        </Button>
      </div>
    </div>
  );
};

const Divider = () => <div className="border-t border-gray-100" />;
