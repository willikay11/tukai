import { DetailRow, DetailsGrid, SectionShell } from '@/app/shared/components/Sections';
import { PlaceProperty } from '@/types/place';

/**
 * The place's "Details" grid.
 *
 * Rows come straight from the API's `properties`, each of which carries its own
 * key, value and Hugeicons name — so a new property type appears here with no
 * code change, and the labels always match what the API actually stores
 * ("Dining Style", "Meal Type", "Cooking Style"…). A hardcoded row list would
 * both miss those and show rows the API never returns.
 */
export const PlaceDetailsSection = ({ properties }: { properties: PlaceProperty[] }) => {
  const rows: DetailRow[] = properties.map((property) => ({
    icon: property.icon || 'InformationCircleIcon',
    label: property.key,
    value: property.value,
    // The API marks the phone row by key; making it dialable is the one
    // behaviour the old page had that is worth keeping
    href: property.key === 'Phone Number' ? `tel:${property.value}` : undefined,
  }));

  if (rows.length === 0) return null;

  return (
    <SectionShell id="details" title="Details">
      <DetailsGrid rows={rows} />
    </SectionShell>
  );
};
