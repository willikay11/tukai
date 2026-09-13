import { IconComponent } from '@/app/shared/components/Icons';

export interface DetailRow {
  // Hugeicons name. Places carry one per property from the API; other callers
  // choose their own.
  icon: string;
  label: string;
  value: string;
  // Rendered as a tel: link — the place API marks phone rows this way
  href?: string;
}

/**
 * The two-column "Details" grid shared by the community and place pages: a
 * leading icon, a quiet label, and the value beneath it.
 *
 * Rows with no value are dropped here rather than at every call site.
 */
export const DetailsGrid = ({ rows }: { rows: DetailRow[] }) => {
  const populated = rows.filter((row) => Boolean(row.value));

  if (populated.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {populated.map((row) => (
        <div key={`${row.label}-${row.value}`} className="flex items-start gap-3">
          <IconComponent
            iconName={row.icon}
            size={24}
            className="mt-0.5 flex-shrink-0 text-gray-600"
          />
          <div className="min-w-0">
            <p className="text-xs text-gray-400">{row.label}</p>
            {row.href ? (
              <a href={row.href} className="block truncate text-sm font-medium text-gray-800">
                {row.value}
              </a>
            ) : (
              <p className="text-sm font-medium text-gray-800">{row.value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
