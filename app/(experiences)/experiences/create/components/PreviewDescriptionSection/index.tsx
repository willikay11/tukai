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
      <div className="flex flex-row justify-between items-start gap-2">
        <div
          className="prose prose-sm mt-4 max-w-none text-xs text-gray-600 flex-1"
          dangerouslySetInnerHTML={{ __html: description }}
        />
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-4">
            <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
          </button>
        )}
      </div>
    </div>
  );
};
