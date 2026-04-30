'use client';

interface DescriptionFieldsProps {
  description: string;
  whatsIncluded: string;
  whatsNotIncluded: string;
  onDescriptionChange: (value: string) => void;
  onWhatsIncludedChange: (value: string) => void;
  onWhatsNotIncludedChange: (value: string) => void;
  descriptionError?: string;
}

export const DescriptionFields = ({
  description,
  whatsIncluded,
  whatsNotIncluded,
  onDescriptionChange,
  onWhatsIncludedChange,
  onWhatsNotIncludedChange,
  descriptionError,
}: DescriptionFieldsProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="description" className="text-xs font-medium text-gray-800">
          Add your experience description
        </label>
        <textarea
          id="description"
          placeholder="Grab people's attention with a detailed description about the experience..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={`min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none ${descriptionError ? 'border-red-500' : ''}`}
        />
        {descriptionError && <p className="text-xs text-red-500">{descriptionError}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="whats-included" className="text-xs font-medium text-gray-800">
          What's included
        </label>
        <textarea
          id="whats-included"
          placeholder="Add what is included in this experience..."
          value={whatsIncluded}
          onChange={(e) => onWhatsIncludedChange(e.target.value)}
          className="min-h-20 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="whats-not-included" className="text-xs font-medium text-gray-800">
          What's NOT included
        </label>
        <textarea
          id="whats-not-included"
          placeholder="Add what is NOT included in this experience..."
          value={whatsNotIncluded}
          onChange={(e) => onWhatsNotIncludedChange(e.target.value)}
          className="min-h-20 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none"
        />
      </div>
    </div>
  );
};
