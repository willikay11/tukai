'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { ItineraryActivity } from '@/types/itinerary';
import { formatDateDDMMYYYY, formatTimeTo12Hour } from '@/utils/date-utils';

interface PreviewActivityRowProps {
  activity: ItineraryActivity;
  dayDate: string | null;
}

export const PreviewActivityRow = ({ activity, dayDate }: PreviewActivityRowProps) => {
  const displayDate = dayDate ? formatDateDDMMYYYY(dayDate) : '';
  const displayStartTime = activity.startTime ? formatTimeTo12Hour(activity.startTime) : '--:--';
  const displayEndTime = activity.endTime ? formatTimeTo12Hour(activity.endTime) : '--:--';

  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-2">
      {/* Photo */}
      {activity.placeImageUrl ? (
        <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={activity.placeImageUrl}
            alt={activity.placeName ?? activity.title}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <IconComponent iconName="Image02Icon" size={24} className="text-gray-600" />
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-xs font-semibold text-gray-900">{activity.title}</p>
          {activity.placeName && (
            <IconComponent
              iconName="ArrowUpRight01Icon"
              size={13}
              className="flex-shrink-0 text-primary"
            />
          )}
        </div>
        <p className="mt-1 truncate text-xs text-gray-900">{activity.description}</p>
        <div className="mt-1 inline-flex items-center gap-1">
          <p className="text-xs text-gray-600">{displayDate}</p>
          <div className="inline-block h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
          <p className="text-xs text-gray-500">
            {displayStartTime} - {displayEndTime}
          </p>
        </div>
      </div>
    </div>
  );
};
