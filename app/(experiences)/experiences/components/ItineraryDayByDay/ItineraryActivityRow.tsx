'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { ItineraryDayActivity, activityPhoto } from '@/types/itinerary';
import { formatDateDDMMYYYY, formatTimeTo12Hour } from '@/utils/date-utils';

export const ItineraryActivityRow = ({
  activity,
  dayDate,
}: {
  activity: ItineraryDayActivity;
  // ISO yyyy-mm-dd for the day this activity sits on
  dayDate: string | null;
}) => {
  const photo = activityPhoto(activity);
  const displayDate = dayDate ? formatDateDDMMYYYY(dayDate) : '';
  const startTime = activity.startTime ? formatTimeTo12Hour(activity.startTime) : null;
  const endTime = activity.endTime ? formatTimeTo12Hour(activity.endTime) : null;
  const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : (startTime ?? '');

  return (
    <div className="flex items-start gap-4">
      {/* The photo column is reserved even without a photo, so every activity's
          text lines up down the day */}
      <div className="h-11 w-11 flex-shrink-0">
        {photo && (
          <div className="relative h-full w-full overflow-hidden rounded-xl">
            <Image
              src={photo}
              alt={activity.place?.title ?? activity.title}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold text-gray-900">{activity.title}</p>
          {activity.place && (
            <IconComponent
              iconName="ArrowUpRight01Icon"
              size={13}
              className="flex-shrink-0 text-primary"
            />
          )}
        </div>

        {(displayDate || timeRange) && (
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {displayDate}
            {displayDate && timeRange && (
              <span className="inline-block h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
            )}
            {timeRange}
          </p>
        )}
      </div>
    </div>
  );
};
