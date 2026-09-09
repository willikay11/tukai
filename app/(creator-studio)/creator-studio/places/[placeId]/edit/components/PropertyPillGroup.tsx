'use client';

import { SelectablePill } from '../../components/WeekdayPills';

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
        {[...options, ...extras].map((option) => (
          <SelectablePill
            key={option}
            label={option}
            isSelected={selected.includes(option)}
            onClick={() => toggle(option)}
          />
        ))}
      </div>
    </div>
  );
};
