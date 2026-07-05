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
        <div className="relative h-12 w-14 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={activity.placeImageUrl}
            alt={activity.placeName ?? activity.title}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-12 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <IconComponent iconName="Location01Icon" size={16} className="text-primary" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="truncate text-sm font-semibold text-gray-900">
            {activity.placeName ?? activity.title}
          </p>
          {activity.placeName && (
            <IconComponent
              iconName="ArrowUpRight01Icon"
              size={13}
              className="flex-shrink-0 text-primary"
            />
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
          <span>{displayDate}</span>
          <span className="inline-block h-1 w-1 rounded-full bg-gray-400" />
          <span>
            {displayStartTime} - {displayEndTime}
          </span>
        </p>
      </div>
    </div>
  );
};
