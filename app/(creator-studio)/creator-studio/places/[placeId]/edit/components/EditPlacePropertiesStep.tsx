'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { PropertyValue } from '../schemas';

/**
 * The key/value details that show under "Good to know" on the place page —
 * opening hours, parking, the phone number people call.
 */
export const EditPlacePropertiesStep = ({
  properties,
  errors,
  onChange,
}: {
  properties: PropertyValue[];
  errors: Record<string, string>;
  onChange: (properties: PropertyValue[]) => void;
}) => {
  const update = (index: number, patch: Partial<PropertyValue>) =>
    onChange(
      properties.map((entry, position) => (position === index ? { ...entry, ...patch } : entry)),
    );

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Details readers scan before they visit. Each one shows as a row on the place page.
      </p>

      {properties.length === 0 && (
        <p className="rounded-2xl bg-gray-50 p-4 text-xs text-gray-500">
          No details yet. Add the ones people ask about most — opening hours, parking, whether it
          takes bookings.
        </p>
      )}

      <ul className="space-y-3">
        {properties.map((property, index) => (
          <li key={property.id} className="rounded-2xl bg-gray-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <Input
                  value={property.key}
                  onChange={(event) => update(index, { key: event.target.value })}
                  placeholder="Detail e.g. Opening hours"
                  aria-label={`Detail ${index + 1} name`}
                />
                {errors[`properties.${index}.key`] && (
                  <p className="mt-1.5 text-xs text-red-500">{errors[`properties.${index}.key`]}</p>
                )}
              </div>

              <div className="flex-1">
                <Input
                  value={property.value}
                  onChange={(event) => update(index, { value: event.target.value })}
                  placeholder="Value e.g. Mon-Sun, 9am - 11pm"
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
                onClick={() => onChange(properties.filter((_, position) => position !== index))}
                aria-label={`Remove ${property.key || `detail ${index + 1}`}`}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center self-end rounded-full text-gray-400 transition hover:bg-white hover:text-destructive sm:self-start"
              >
                <IconComponent iconName="Delete02Icon" color="currentColor" size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        variant="gradient-outline"
        className="rounded-full"
        onClick={() => onChange([...properties, { id: `new-${Date.now()}`, key: '', value: '' }])}
      >
        <span className="flex items-center gap-2">
          <IconComponent iconName="PlusSignIcon" color="currentColor" size={16} />
          Add a detail
        </span>
      </Button>
    </div>
  );
};
