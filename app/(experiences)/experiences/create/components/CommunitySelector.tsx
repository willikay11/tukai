'use client';

import { useCallback } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

export interface Community {
  id: string;
  name: string;
  imageUrl: string;
}

export interface CommunitySelectorProps {
  value: Community | null;
  options: Community[];
  onChange: (community: Community) => void;
  error?: string;
}

export const CommunitySelector = ({
  value,
  options,
  onChange,
  error,
}: CommunitySelectorProps) => {
  const handleSelect = useCallback(
    (community: Community) => {
      onChange(community);
    },
    [onChange],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-900">Select host community</label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              aria-label="Information about community selection"
            >
              <IconComponent iconName="InformationCircleIcon" size={18} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 text-sm">
            Select a community you created to host this experience
          </PopoverContent>
        </Popover>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex h-[55px] w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left',
              error ? 'border-red-500' : 'border-gray-200',
              value ? 'text-gray-900' : 'text-gray-400',
            )}
          >
            {value ? (
              <>
                <img
                  src={value.imageUrl}
                  alt={value.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="flex-1 text-sm font-medium">{value.name}</span>
                <IconComponent iconName="CheckIcon" size={20} className="text-emerald-600" />
              </>
            ) : (
              <span className="text-sm">Select a community</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-2 p-2" align="start">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No communities available</div>
          ) : (
            options.map((community) => (
              <button
                key={community.id}
                type="button"
                onClick={() => handleSelect(community)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-100',
                  value?.id === community.id && 'bg-emerald-50',
                )}
              >
                <img
                  src={community.imageUrl}
                  alt={community.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="flex-1 text-sm font-medium">{community.name}</span>
                {value?.id === community.id && (
                  <IconComponent iconName="CheckIcon" size={20} className="text-emerald-600" />
                )}
              </button>
            ))
          )}
        </PopoverContent>
      </Popover>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
