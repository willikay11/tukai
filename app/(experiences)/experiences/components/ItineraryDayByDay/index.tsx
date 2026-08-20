'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { useFetchItineraryDays } from '@/app/shared/hooks/useExperiences';
import { ItineraryDay, itineraryDayDate } from '@/types/itinerary';
import { toPlainText } from '@/utils/safe-text-utils';

import { ItineraryActivityRow } from './ItineraryActivityRow';

interface ItineraryDayByDayProps {
  experienceId: string;
  // Day N is this date plus N-1; the API stores no per-day date
  startDate: string | null;
}

export const ItineraryDayByDay = ({ experienceId, startDate }: ItineraryDayByDayProps) => {
  const { data: response, isLoading } = useFetchItineraryDays(experienceId);

  const days: ItineraryDay[] = (response?.data?.results ?? [])
    .slice()
    .sort((a: ItineraryDay, b: ItineraryDay) => a.dayNumber - b.dayNumber);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-28 w-full animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  // Not an itinerary, or one with no days entered yet
  if (days.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="font-bold text-gray-900">Day by day</h3>

      <div className="mt-6 space-y-8">
        {days.map((day) => {
          const date = itineraryDayDate(startDate, day.dayNumber);
          const description = toPlainText(day.description);

          return (
            <div key={day.id}>
              <div className="flex items-center gap-3">
                <IconComponent
                  iconName="Calendar03Icon"
                  size={16}
                  color="currentColor"
                  className="flex-shrink-0 text-gray-900"
                />
                <h4 className="text-sm font-bold text-gray-900">
                  Day {day.dayNumber}
                  {date && `: ${moment(date).format('ddd D MMMM')}`}
                </h4>
              </div>

              {/* The dashed rule runs down the day, aligned under the icon */}
              <div className="ml-[9px] border-l border-dashed border-gray-300 pb-2 pl-8 pt-3">
                {day.title && <p className="text-xs font-bold text-gray-900">{day.title}</p>}
                {description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-600">{description}</p>
                )}

                {day.activities.length > 0 && (
                  <div className="mt-5 space-y-5">
                    {day.activities
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((activity) => (
                        <ItineraryActivityRow
                          key={activity.id}
                          activity={activity}
                          dayDate={date ? moment(date).format('YYYY-MM-DD') : null}
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
