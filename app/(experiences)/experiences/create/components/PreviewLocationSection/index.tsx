'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface PreviewLocationSectionProps {
  location: string | null;
  onEdit?: () => void;
}

export const PreviewLocationSection = ({ location, onEdit }: PreviewLocationSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Experience Location</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className='text-gray-800' />
          </button>
        )}
      </div>
      {location ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className='bg-gray-100 rounded-[12px] p-4'>
              <IconComponent iconName="Image02Icon" size={28} className="text-gray-600" />
            </div>
            <p className="text-xs font-medium text-gray-800">{location}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not set yet</p>
      )}
    </div>
  );
};
