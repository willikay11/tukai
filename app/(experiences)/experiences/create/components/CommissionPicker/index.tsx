'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface CommissionPickerProps {
  value: 'host' | 'customer' | 'split';
  onChange: (value: 'host' | 'customer' | 'split') => void;
  // Each pick is saved to the experience — locked while that is in flight so
  // two rapid picks cannot land out of order
  isSaving?: boolean;
}

const commissionOptions = [
  { value: 'host' as const, label: 'I will fully pay the commission' },
  { value: 'customer' as const, label: 'The customer will pay the commission' },
  { value: 'split' as const, label: 'Split 50-50 between the customer and myself' },
];

export const CommissionPicker = ({ value, onChange, isSaving = false }: CommissionPickerProps) => {
  return (
    <div className="space-y-3">
      <label className="text-xs font-medium text-gray-800">
        Fees allocation{' '}
        <span className="font-normal text-gray-500">
          (Tukai charges a 4% commission, who should pay this commission?)
        </span>
      </label>
      <div className="space-y-2">
        {commissionOptions.map(
          (option: { value: 'host' | 'customer' | 'split'; label: string }) => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={isSaving}
                onClick={() => {
                  onChange(option.value as 'host' | 'customer' | 'split');
                }}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                  isSelected
                    ? 'border-primary bg-gradient-to-b from-[#047857] to-[#064E3B] text-white'
                    : 'bg-gray-100 text-gray-700 hover:border-gray-400'
                } `}
              >
                <span>{option.label}</span>
                {isSelected && isSaving && (
                  <IconComponent iconName="Loading03Icon" size={14} className="animate-spin" />
                )}
              </button>
            );
          },
        )}
      </div>
    </div>
  );
};
