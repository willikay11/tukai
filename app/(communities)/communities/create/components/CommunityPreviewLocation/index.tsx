'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface CommunityPreviewLocationProps {
  location: string;
}

export const CommunityPreviewLocation = ({ location }: CommunityPreviewLocationProps) => {
  return (
    <div className="flex items-start gap-2">
      <IconComponent
        iconName="MapPin02Icon"
        size={16}
        className="mt-0.5 flex-shrink-0 text-gray-600"
      />
      <div>
        <p className="text-xs font-medium text-gray-600">Location</p>
        <p className="mt-0.5 text-xs text-gray-900">{location}</p>
      </div>
    </div>
  );
};
