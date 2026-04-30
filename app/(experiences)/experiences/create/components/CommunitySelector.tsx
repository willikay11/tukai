'use client';

import { useCallback } from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IconComponent } from '@/app/shared/components/Icons';

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
    (communityId: string) => {
      const selected = options.find((c) => c.id === communityId);
      if (selected) {
        onChange(selected);
      }
    },
    [options, onChange],
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-900">Select host community</label>
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

      <Select value={value?.id || ''} onValueChange={handleSelect}>
        <SelectTrigger
          className={error ? 'border-red-500' : ''}
        >
          {value ? (
            <div className="flex items-center gap-2">
              <img
                src={value.imageUrl}
                alt={value.name}
                className="h-6 w-6 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{value.name}</span>
            </div>
          ) : (
            <SelectValue placeholder="Select a community" />
          )}
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 ? (
            <div className="px-2 py-1.5 text-sm text-gray-500">No communities available</div>
          ) : (
            options.map((community) => (
              <SelectItem key={community.id} value={community.id}>
                <div className="flex items-center gap-2">
                  <img
                    src={community.imageUrl}
                    alt={community.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{community.name}</span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
