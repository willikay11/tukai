'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PlaceProperty } from '@/types/place';

/**
 * The drawer's facts grid - phone, hours, type of place, and whatever else the
 * API stores against the place.
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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))] gap-x-6 gap-y-5">
      {rows.map((property) => (
        <div key={property.id} className="flex min-w-0 items-start gap-4">
          <IconComponent
            iconName={property.icon || 'InformationCircleIcon'}
            size={22}
            color="currentColor"
            className="mt-px flex-shrink-0 text-ink-label"
          />

          <div className="flex min-w-0 flex-col gap-[3px]">
            <p className="text-[15px] font-semibold text-ink-label">{property.key}</p>

            {/* The value row is 44px tall so a link or copy button is a full
                touch target; the negative margin keeps the visual gap to the label */}
            <div className="-my-3 flex min-w-0 items-center gap-1">
              {property.linkType ? (
                <a
                  href={
                    property.linkType === 'email'
                      ? `mailto:${property.value}`
                      : toWebsiteHref(property.value)
                  }
                  target={property.linkType === 'website' ? '_blank' : undefined}
                  rel={property.linkType === 'website' ? 'noopener noreferrer' : undefined}
                  className="inline-flex min-h-11 min-w-0 items-center break-all text-[14.5px] text-ink-muted hover:text-brand hover:underline"
                >
                  {property.value}
                </a>
              ) : (
                <p className="inline-flex min-h-11 min-w-0 items-center text-pretty text-[14.5px] leading-[1.45] text-ink-muted">
                  {property.value}
                </p>
              )}

              {/* The API marks the phone row by key; copying it is the one
                  thing a reader on a laptop cannot do by tapping */}
              {property.canCopy && (
                <button
                  type="button"
                  onClick={() => copy(property)}
                  aria-label={
                    copiedKey === property.id ? `${property.key} copied` : `Copy ${property.key}`
                  }
                  title="Copy"
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-brand transition-colors hover:bg-surface-brand"
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

// A website saved without its scheme would otherwise resolve relative to the
// drawer's own page
const toWebsiteHref = (value: string) => (/^https?:\/\//i.test(value) ? value : `https://${value}`);
