'use client';

import { ExperienceLocationInput } from '../../ExperienceLocationInput';

interface EditLocationFieldProps {
  value: string;
  placeId?: string;
  onChange: (value: string, placeId?: string) => void;
  error?: string;
}

export const EditLocationField = ({ value, placeId, onChange, error }: EditLocationFieldProps) => {
  return (
    <div>
      <ExperienceLocationInput value={value} placeId={placeId} onChange={onChange} error={error} />
    </div>
  );
};
