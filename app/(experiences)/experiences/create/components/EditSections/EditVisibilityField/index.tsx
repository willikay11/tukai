'use client';

interface EditVisibilityFieldProps {
  value: 'public' | 'private';
  onChange: (visibility: 'public' | 'private') => void;
  error?: string;
}

export const EditVisibilityField = ({
  value,
  onChange,
  error,
}: EditVisibilityFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-800">Visibility</label>
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="visibility"
            value="public"
            checked={value === 'public'}
            onChange={() => onChange('public')}
            className="mt-1"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Public</p>
            <p className="text-xs text-gray-600">Anyone can see and book this experience</p>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="radio"
            name="visibility"
            value="private"
            checked={value === 'private'}
            onChange={() => onChange('private')}
            className="mt-1"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Private</p>
            <p className="text-xs text-gray-600">Only invited guests can see and book</p>
          </div>
        </label>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
