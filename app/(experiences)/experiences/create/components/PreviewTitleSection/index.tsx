'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewTitleSectionProps {
  title: string;
  onEdit?: () => void;
}

export const PreviewTitleSection = ({ title, onEdit }: PreviewTitleSectionProps) => {
  return (
    <div className="relative">
      <div className="flex flex-row justify-between items-start">
        <p className="text-xl font-bold text-gray-900">{title}</p>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
          </button>
        )}
      </div>
    </div>
  );
};
