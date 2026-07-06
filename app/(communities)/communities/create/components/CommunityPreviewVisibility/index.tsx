'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface CommunityPreviewVisibilityProps {
  visibility: 'public' | 'private';
}

export const CommunityPreviewVisibility = ({ visibility }: CommunityPreviewVisibilityProps) => {
  const icon = visibility === 'public' ? 'Globe01Icon' : 'Lock02Icon';
  const label = visibility === 'public' ? 'Public Community' : 'Private Community';
  const description =
    visibility === 'public'
      ? 'Anyone can see and join this community'
      : 'Only invited members can see and join';

  return (
    <div className="flex items-start gap-2">
      <IconComponent iconName={icon} size={16} className="mt-0.5 flex-shrink-0 text-gray-600" />
      <div>
        <p className="text-xs font-medium text-gray-600">{label}</p>
        <p className="mt-0.5 text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
};
