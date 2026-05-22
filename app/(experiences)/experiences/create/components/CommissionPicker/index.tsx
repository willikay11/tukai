'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CommissionPickerProps {
  value: 'host' | 'customer' | 'split';
  onChange: (value: 'host' | 'customer' | 'split') => void;
}

const commissionOptions = [
  { value: 'host' as const, label: 'I will fully pay the commission' },
  { value: 'customer' as const, label: 'The customer will pay the commission' },
  { value: 'split' as const, label: 'Split 50-50 between the customer and myself' },
];

export const CommissionPicker = ({ value, onChange }: CommissionPickerProps) => {
  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-gray-800">
        Fees allocation (Tukai charges a 4% commission, who should pay this commission?)
      </label>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as 'host' | 'customer' | 'split')}
      >
        <div className="space-y-2">
          {commissionOptions.map((option) => (
            <div key={option.value} className="flex items-center gap-3">
              <RadioGroupItem value={option.value} id={`commission-${option.value}`} />
              <label
                htmlFor={`commission-${option.value}`}
                className="flex cursor-pointer items-center gap-2 text-xs text-gray-800"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};
