'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { ItineraryActivity } from '@/types/itinerary';
import { sortActivitiesByTime } from '@/utils/itinerary-utils';

import { PreviewActivityRow } from '../PreviewActivityRow';

interface PreviewItineraryDayPillProps {
  dayNumber: number;
  title: string;
  description: string;
  activities: ItineraryActivity[];
  dayDate: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}

export const PreviewItineraryDayPill = ({
  dayNumber,
  title,
  description,
  activities,
  dayDate,
  isExpanded,
  onToggle,
  isLast,
}: PreviewItineraryDayPillProps) => {
  const hasContent = title || description || activities.length > 0;

  return (
    <div className="relative flex gap-3">
      {/* Timeline dot + dashed line */}
      <div className="flex flex-col items-center">
        <div className="z-10 mt-3.5 h-1.5 w-1.5 flex-shrink-0 rounded-full border-2 border-gray-300 bg-gray-300" />
        <div className="pointer-events-none absolute left-1 mt-4 h-0 w-3.5 border-t-[1px] border-dashed border-gray-300" />
        {!isLast && (
          <div className="absolute -bottom-[14px] top-2.5 mt-1 flex-1 border-l-[1px] border-dashed border-gray-300" />
        )}
        {/* {!isLast && (
          <div className="mt-1 flex-1 border-l-2 border-dashed border-primary/40" />
        )} */}
      </div>

      {/* Pill + expanded content */}
      <div className="flex-1 pb-4">
        {/* Pill header row */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-2 rounded-full border-[1px] border-dashed border-primary/50 bg-primary/5 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <IconComponent iconName="Calendar03Icon" size={14} className="text-primary" />
            <span className="max-w-[280px] truncate">
              Day {dayNumber}
              {title && `: ${title.slice(0, 40)}${title.length > 40 ? '...' : ''}`}
            </span>
            <IconComponent
              iconName={isExpanded ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
              size={14}
              className="text-primary"
            />
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && hasContent && (
          <div className="mt-3 space-y-2 pl-1">
            {title && <p className="text-xs font-semibold text-gray-900">{title}</p>}

            {description && <p className="text-xs leading-relaxed text-gray-600">{description}</p>}

            {activities.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-xs font-medium text-gray-800">
                  Where will these activities take place?
                </p>
                <div className="space-y-2">
                  {sortActivitiesByTime(activities).map((activity) => (
                    <PreviewActivityRow key={activity.id} activity={activity} dayDate={dayDate} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
