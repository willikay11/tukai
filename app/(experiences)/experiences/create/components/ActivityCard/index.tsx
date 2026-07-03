'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { TimePicker } from '@/components/ui/time-picker';
import { ItineraryActivity } from '@/types/itinerary';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ActivityCardProps {
  activity: ItineraryActivity;
  dayDate: string | null;
  onChange: (data: Partial<ItineraryActivity>) => void;
  onDelete: () => void;
}

export const ActivityCard = ({
  activity,
  dayDate,
  onChange,
  onDelete,
}: ActivityCardProps) => {
  return (
    <div className="border border-dashed border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Place header — only if place attached */}
      {activity.placeId && (
        <div className="flex items-center gap-3 p-2 border-b border-gray-100">
          {activity.placeImageUrl ? (
            <div className="relative w-16 h-14 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={activity.placeImageUrl}
                alt={activity.placeName ?? ''}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-14 rounded-lg bg-primary/10 flex-shrink-0 flex items-center justify-center">
              <IconComponent
                iconName="Location01Icon"
                size={18}
                className="text-primary"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {activity.placeName}
              </p>
              <IconComponent
                iconName="ArrowUpRight01Icon"
                size={14}
                className="text-primary flex-shrink-0"
              />
            </div>
            {activity.placeCity && (
              <p className="text-xs text-gray-500">{activity.placeCity}</p>
            )}
          </div>

          {/* Delete activity */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-red-400 hover:text-red-600 mr-1"
            aria-label="Delete activity"
          >
            <IconComponent iconName="Delete02Icon" size={16} />
          </button>
        </div>
      )}

      {/* No place — show generic header with delete */}
      {!activity.placeId && (
        <div className="flex items-center justify-between px-3 pt-3">
          <p className="text-xs font-medium text-gray-500">
            Activity (no specific place)
          </p>
          <button
            type="button"
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-600"
            aria-label="Delete activity"
          >
            <IconComponent iconName="Delete02Icon" size={14} />
          </button>
        </div>
      )}

      {/* Activity fields */}
      <div className="p-3 space-y-3">
        <Input
          type="text"
          value={activity.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Activity Title"
        />

        <Textarea
          value={activity.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Add a brief description about this activity"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-3">
          <TimePicker
            label="Start Time"
            value={activity.startTime}
            onChange={(time) => onChange({ startTime: time })}
          />
          <TimePicker
            label="End Time"
            value={activity.endTime}
            onChange={(time) => onChange({ endTime: time })}
          />
        </div>
      </div>
    </div>
  );
};
