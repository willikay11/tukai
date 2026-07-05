'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { ItineraryActivity } from '@/types/itinerary';
import { PreviewActivityRow } from '../PreviewActivityRow';

interface PreviewItineraryDayPillProps {
  dayNumber: number;
  title: string;
  description: string;
  activities: ItineraryActivity[];
  dayDate: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
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
  onEdit,
  isLast,
}: PreviewItineraryDayPillProps) => {
  const hasContent = title || description || activities.length > 0;

  return (
    <div className="relative flex gap-3">
      {/* Timeline dot + dashed line */}
      <div className="flex flex-col items-center">
        <div className="z-10 mt-3.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />
        {!isLast && (
          <div className="mt-1 flex-1 border-l-2 border-dashed border-primary/40" />
        )}
      </div>

      {/* Pill + expanded content */}
      <div className="flex-1 pb-4">
        {/* Pill header row */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-2 rounded-full border-2 border-dashed border-primary/50 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
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

          {/* Edit icon */}
          <button
            type="button"
            onClick={onEdit}
            className="ml-auto text-gray-400 transition-colors hover:text-primary"
          >
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        </div>

        {/* Expanded content */}
        {isExpanded && hasContent && (
          <div className="mt-3 space-y-3 pl-1">
            {title && <p className="text-sm font-semibold text-gray-900">{title}</p>}

            {description && <p className="text-sm leading-relaxed text-gray-600">{description}</p>}

            {activities.length > 0 && (
              <div className="space-y-2 pt-1">
                <p className="text-sm font-medium text-gray-800">
                  Where will these activities take place?
                </p>
                <div className="space-y-2">
                  {activities.map((activity) => (
                    <PreviewActivityRow
                      key={activity.id}
                      activity={activity}
                      dayDate={dayDate}
                    />
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
