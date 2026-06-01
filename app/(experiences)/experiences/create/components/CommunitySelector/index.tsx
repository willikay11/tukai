'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';

export interface Community {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface CommunitySelectorProps {
  communities: Community[];
  value: Community | null;
  onChange: (community: Community | null) => void;
  onCreateNew?: () => void;
  isLoading?: boolean;
  error?: string;
}

export const CommunitySelector = ({
  communities,
  value,
  onChange,
  onCreateNew,
  isLoading = false,
  error,
}: CommunitySelectorProps) => {
  const handlePillClick = (community: Community) => {
    // Toggle behavior: if already selected, deselect; otherwise select
    if (value?.id === community.id) {
      onChange(null);
    } else {
      onChange(community);
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-gray-800">Select Host Community</label>
        <IconComponent
          iconName="InformationCircleIcon"
          size={16}
          className="text-gray-400"
        />
      </div>

      {/* Community pills */}
      {isLoading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-32 rounded-full bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {communities.map((community) => {
            const isSelected = value?.id === community.id;
            return (
              <button
                key={community.id}
                type="button"
                onClick={() => handlePillClick(community)}
                className={`
                  flex items-center gap-2
                  pl-1 pr-4 py-1
                  rounded-full border
                  text-sm font-medium
                  transition-colors duration-150
                  ${
                    isSelected
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-gray-200 text-gray-800 hover:border-gray-400'
                  }
                `}
              >
                {/* Community image */}
                <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                  {community.imageUrl ? (
                    <Image
                      src={community.imageUrl}
                      alt={community.name}
                      width={28}
                      height={28}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <IconComponent
                        iconName="UserIcon"
                        size={14}
                        className="text-gray-400"
                      />
                    </div>
                  )}
                </div>

                {/* Community name */}
                <span>{community.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Create a Community link */}
      {onCreateNew && (
        <button
          type="button"
          onClick={onCreateNew}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gray-700"
        >
          <IconComponent
            iconName="UserAdd01Icon"
            size={16}
            className="text-muted-foreground"
          />
          <span>Create a Community</span>
        </button>
      )}

      {/* Error message */}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
