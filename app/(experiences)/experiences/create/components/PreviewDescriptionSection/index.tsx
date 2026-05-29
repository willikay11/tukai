'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewDescriptionSectionProps {
  description: string;
  onEdit?: () => void;
}

export const PreviewDescriptionSection = ({
  description,
  onEdit,
}: PreviewDescriptionSectionProps) => {
  return (
    <div className="relative">
      <div className="flex flex-row items-start justify-between gap-2">
        <div
          className="prose prose-sm max-w-none flex-1 text-xs text-gray-600"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        {onEdit && (
          <button onClick={onEdit} className="mt-4 flex-shrink-0 text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
          </button>
        )}
      </div>
    </div>
  );
};
