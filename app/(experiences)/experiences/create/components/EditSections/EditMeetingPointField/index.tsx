'use client';

interface EditMeetingPointFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const EditMeetingPointField = ({
  value,
  onChange,
  error,
}: EditMeetingPointFieldProps) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-gray-800">Meeting Point</label>
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        placeholder="Enter meeting point location"
        rows={3}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
