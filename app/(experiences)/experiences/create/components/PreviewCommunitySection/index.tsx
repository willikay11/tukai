'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';

interface PreviewCommunitySectionProps {
  communityName: string | null;
  communityImageUrl: string | null;
  communityMembersCount?: number;
  onEdit?: () => void;
}

export const PreviewCommunitySection = ({
  communityName,
  communityImageUrl,
  communityMembersCount = 0,
  onEdit,
}: PreviewCommunitySectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Host Community</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
          </button>
        )}
      </div>
      {communityName && communityImageUrl ? (
        <div className="flex items-center gap-2">
          {/* Same tile as the Experience Location image */}
          <div className="relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-[12px]">
            <PhotoImage
              src={communityImageUrl}
              alt={communityName ?? ''}
              fill
              sizes="60px"
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-800">{communityName}</p>
            {communityMembersCount > 0 && (
              <p className="text-xs text-gray-600">{communityMembersCount} Experience hosted</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not selected yet</p>
      )}
    </div>
  );
};
