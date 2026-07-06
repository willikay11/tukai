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

export const ActivityListItem = ({ activity, onEdit, onDelete }: ActivityListItemProps) => {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3">
      {/* Photo on the left */}
      {activity.placeImageUrl ? (
        <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={activity.placeImageUrl}
            alt={activity.placeName ?? ''}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
          {activity.placeId ? (
            <IconComponent iconName="Image02Icon" size={20} className="text-primary" />
          ) : (
            <IconComponent iconName="Image02Icon" size={24} className="text-gray-600" />
          )}
        </div>
      )}

      {/* Content in the center */}
      <div className="min-w-0 flex-1">
        {/* Title */}
        <p className="truncate text-sm font-semibold text-gray-900">{activity.title}</p>

        {/* Description */}
        {activity.description && (
          <p className="line-clamp-1 text-xs text-gray-600">{activity.description}</p>
        )}

        {/* Time (under description) */}
        {(activity.startTime || activity.endTime) && (
          <p className="mt-1 text-xs text-gray-500">
            {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
          </p>
        )}

        {/* Location */}
        {activity.placeName && (
          <p className="truncate text-xs text-gray-500">{activity.placeName}</p>
        )}
      </div>

      {/* Edit and Delete icons on the right */}
      <div className="flex flex-shrink-0 items-center gap-1">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 text-gray-400 transition-colors hover:text-primary"
            aria-label="Edit activity"
          >
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-gray-400 transition-colors hover:text-red-500"
            aria-label="Delete activity"
          >
            <IconComponent iconName="Delete02Icon" size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
