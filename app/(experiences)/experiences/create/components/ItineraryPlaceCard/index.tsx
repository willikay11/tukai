'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { TimePicker } from '@/components/ui/time-picker';
import { ItineraryDayPlace } from '@/types/itinerary';

interface ItineraryPlaceCardProps {
  place: ItineraryDayPlace;
  dayDate: string | null;
  isEditingTime: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onStartTimeChange: (time: string | null) => void;
  onEndTimeChange: (time: string | null) => void;
}

const formatDisplayDate = (date: string | null) => {
  if (!date) return '-- -- ----';
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const formatDisplayTime = (time: string | null) => {
  if (!time) return '--:--';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

export const ItineraryPlaceCard = ({
  place,
  dayDate,
  isEditingTime,
  onEdit,
  onDelete,
  onStartTimeChange,
  onEndTimeChange,
}: ItineraryPlaceCardProps) => {
  return (
    <div className="space-y-3">
      {/* Place card */}
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-2">
        {/* Photo — rounded, fixed size, not full bleed */}
        {place.imageUrl ? (
          <div className="relative h-16 w-36 flex-shrink-0 overflow-hidden rounded-lg">
            <PhotoImage
              src={place.imageUrl}
              alt={place.placeName}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <IconComponent iconName="Location01Icon" size={20} className="text-primary" />
          </div>
        )}

        {/* Info */}
        <div className="min-w-0 flex-1">
          {/* Name + link icon */}
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-semibold text-gray-900">{place.placeName}</p>
            <IconComponent
              iconName="ArrowUpRight01Icon"
              size={14}
              className="flex-shrink-0 text-primary"
            />
          </div>

          {/* Date + time */}
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
            {/* <span>{formatDisplayDate(dayDate)}</span> */}
            {/* <span className="inline-block h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" /> */}
            <span>
              {place.startTime ? formatDisplayTime(place.startTime) : '--:--'}
              {' - '}
              {place.endTime ? formatDisplayTime(place.endTime) : '--:--'}
            </span>
          </p>
        </div>

        {/* Edit + divider + delete */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 text-gray-400 transition-colors hover:text-primary"
          >
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-gray-400 transition-colors hover:text-red-500"
          >
            <IconComponent iconName="Delete02Icon" size={16} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Time form — shown when editing (no date picker) */}
      {isEditingTime && (
        <div className="space-y-3 px-1">
          <p className="text-sm text-gray-600">
            Add the time you will visit <span className="font-bold">{place.placeName}</span>
          </p>

          {/* Start + End time side by side */}
          <div className="grid grid-cols-2 gap-3">
            <TimePicker
              value={place.startTime || undefined}
              placeholder="Start Time"
              onChange={onStartTimeChange}
            />
            <TimePicker
              value={place.endTime || undefined}
              placeholder="End Time"
              onChange={onEndTimeChange}
              minTime={place.startTime || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
};
