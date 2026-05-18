'use client';

import { Checkbox } from '@/components/ui/checkbox';

interface DuplicateTicketsCheckboxProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const DuplicateTicketsCheckbox = ({
  value,
  onChange,
}: DuplicateTicketsCheckboxProps) => {
  return (
    <div className="flex items-center gap-2 pt-1">
      <Checkbox
        id="duplicate-tickets"
        checked={value}
        onCheckedChange={(checked) => onChange(checked === true)}
      />
      <label
        htmlFor="duplicate-tickets"
        className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-900"
      >
        Duplicate ticket(s) for the entire period
      </label>
    </div>
  );
};
