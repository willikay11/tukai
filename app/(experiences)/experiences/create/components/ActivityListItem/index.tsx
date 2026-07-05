'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { ItineraryActivity } from '@/types/itinerary';

interface ActivityListItemProps {
  activity: ItineraryActivity;
  onEdit?: () => void;
  onDelete?: () => void;
}

const formatTime = (time: string | null) => {
  if (!time) return '--:--';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

export const ActivityListItem = ({
  activity,
  onEdit,
  onDelete,
}: ActivityListItemProps) => {
  return (
    <div className="flex items-center gap-3 border border-dashed border-gray-200 rounded-lg bg-gray-50 p-3">
      {/* Photo on the left */}
      {activity.placeImageUrl ? (
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={activity.placeImageUrl}
            alt={activity.placeName ?? ''}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
          {activity.placeId ? (
            <IconComponent
              iconName="Location01Icon"
              size={20}
              className="text-primary"
            />
          ) : (
            <IconComponent
              iconName="Activity01Icon"
              size={20}
              className="text-gray-400"
            />
          )}
        </div>
      )}

      {/* Content in the center */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p className="text-sm font-semibold text-gray-900 truncate">
          {activity.title}
        </p>

        {/* Description */}
        {activity.description && (
          <p className="text-xs text-gray-600 line-clamp-1">
            {activity.description}
          </p>
        )}

        {/* Time (under description) */}
        {(activity.startTime || activity.endTime) && (
          <p className="text-xs text-gray-500 mt-1">
            {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
          </p>
        )}

        {/* Location */}
        {activity.placeName && (
          <p className="text-xs text-gray-500 truncate">
            {activity.placeName}
          </p>
        )}
      </div>

      {/* Edit and Delete icons on the right */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-primary transition-colors"
            aria-label="Edit activity"
          >
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Delete activity"
          >
            <IconComponent iconName="Delete02Icon" size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
