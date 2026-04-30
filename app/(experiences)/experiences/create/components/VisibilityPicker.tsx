'use client';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface VisibilityPickerProps {
  value: 'public' | 'private';
  onChange: (value: 'public' | 'private') => void;
}

export const VisibilityPicker = ({ value, onChange }: VisibilityPickerProps) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-800">
        Experience visibility (who can see or access the experience)
      </label>
      <RadioGroup value={value} onValueChange={(val) => onChange(val as 'public' | 'private')}>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="public" id="visibility-public" />
          <label htmlFor="visibility-public" className="flex cursor-pointer items-center gap-2 text-sm">
            <span className="font-medium text-gray-900">Public (Everyone)</span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="private" id="visibility-private" />
          <label htmlFor="visibility-private" className="flex cursor-pointer items-center gap-2 text-sm">
            <span className="font-medium text-gray-900">Private (Only invited people)</span>
          </label>
        </div>
      </RadioGroup>
    </div>
  );
};
