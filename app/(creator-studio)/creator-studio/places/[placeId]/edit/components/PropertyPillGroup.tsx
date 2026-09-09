'use client';

import { cn } from '@/lib/utils';

/**
 * One property, chosen from pills.
 *
 * Every group is multi-select and stores its value as the chosen labels joined
 * with ", " — the format places already hold, so what is saved here reads the
 * same way on the place page as what the mobile app writes.
 *
 * A saved value that is not one of the offered options still shows, selected,
 * at the end. Places carry plenty of those ("Mobile money" beside the offered
 * "Mobile Money"), and dropping them from the form would delete them on save.
 */
export const PropertyPillGroup = ({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) => {
  const extras = selected.filter((value) => !options.includes(value));

  const toggle = (option: string) =>
    onChange(
      selected.includes(option)
        ? selected.filter((entry) => entry !== option)
        : [...selected, option],
    );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-800">{label}</p>

      <div className="flex flex-wrap gap-2">
        {[...options, ...extras].map((option) => {
          const isSelected = selected.includes(option);

          return (
            <button
              key={option}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(option)}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-medium transition-colors',
                isSelected
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};
