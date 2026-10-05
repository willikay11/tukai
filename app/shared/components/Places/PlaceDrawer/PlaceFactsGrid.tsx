'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PlaceProperty } from '@/types/place';

/**
 * The drawer's two-column facts grid — phone, hours, type of place, and
 * whatever else the API stores against the place.
 *
 * Rows come straight from `properties`, each carrying its own key, value and
 * Hugeicons name, so a new property type appears here with no code change.
 *
 * Deliberately not the shared DetailsGrid: this design leads with the LABEL in
 * bold and sets the value quietly beneath it, where that one does the
 * opposite. The community page still wants the old emphasis.
 */
export const PlaceFactsGrid = ({ properties }: { properties: PlaceProperty[] }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rows = properties.filter((property) => Boolean(property.value));
  if (rows.length === 0) return null;

  const copy = async (property: PlaceProperty) => {
    try {
      await navigator.clipboard.writeText(property.value);
      setCopiedKey(property.id);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // A browser that refuses the clipboard leaves the value on screen to be
      // selected by hand; there is nothing useful to say about it
    }
  };

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
      {rows.map((property) => (
        <div key={property.id} className="flex items-start gap-3">
          <IconComponent
            iconName={property.icon || 'InformationCircleIcon'}
            size={24}
            color="currentColor"
            className="mt-0.5 flex-shrink-0 text-brand-ink"
          />

          <div className="min-w-0">
            <p className="text-[17px] font-bold text-brand-ink">{property.key}</p>

            <div className="flex items-center gap-2.5">
              <p className="text-[15px] text-ink-muted">{property.value}</p>

              {/* The API marks the phone row by key; copying it is the one
                  thing a reader on a laptop cannot do by tapping */}
              {property.canCopy && (
                <button
                  type="button"
                  onClick={() => copy(property)}
                  aria-label={
                    copiedKey === property.id ? `${property.key} copied` : `Copy ${property.key}`
                  }
                  className="flex-shrink-0 text-brand transition-opacity hover:opacity-70"
                >
                  <IconComponent
                    iconName={copiedKey === property.id ? 'Tick02Icon' : 'Copy01Icon'}
                    size={18}
                    color="currentColor"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
