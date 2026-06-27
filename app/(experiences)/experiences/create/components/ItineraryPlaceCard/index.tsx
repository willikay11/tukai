'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { ItineraryDayPlace } from '@/types/itinerary';

interface ItineraryPlaceCardProps {
  place: ItineraryDayPlace;
  isEditingDate: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onDateChange: (date: string | null) => void;
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
  isEditingDate,
  onEdit,
  onDelete,
  onDateChange,
  onStartTimeChange,
  onEndTimeChange,
}: ItineraryPlaceCardProps) => {
  return (
    <div className="space-y-3">
      {/* Place card */}
      <div className="flex items-center gap-3 overflow-hidden rounded-xl border border-dashed border-gray-200 bg-white">
        {/* Place photo */}
        {place.imageUrl && (
          <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden">
            <Image
              src={place.imageUrl}
              alt={place.placeName}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        )}

        {/* Place info */}
        <div className="min-w-0 flex-1 py-3">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-gray-900">{place.placeName}</p>
            {/* External link icon */}
            <IconComponent
              iconName="ArrowUpRight01Icon"
              size={14}
              className="flex-shrink-0 text-primary"
            />
          </div>

          {/* Date + time */}
          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <span>{formatDisplayDate(place.date)}</span>
            <span className="inline-block h-1 w-1 rounded-full bg-gray-400" />
            <span>
              {formatDisplayTime(place.startTime)}
              {' - '}
              {formatDisplayTime(place.endTime)}
            </span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-1 pr-3">
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
            <IconComponent iconName="Delete02Icon" size={16} />
          </button>
        </div>
      </div>

      {/* Date/time form — shown when editing */}
      {isEditingDate && (
        <div className="space-y-3 px-1">
          <p className="text-sm text-gray-600">
            Add the date and time you will visit{' '}
            <span className="font-bold">{place.placeName}</span>
          </p>

          {/* Date picker */}
          <DatePicker value={place.date || undefined} onChange={onDateChange} />

          {/* Start + End time side by side */}
          <div className="grid grid-cols-2 gap-3">
            <TimePicker value={place.startTime || undefined} onChange={onStartTimeChange} />
            <TimePicker value={place.endTime || undefined} onChange={onEndTimeChange} />
          </div>
        </div>
      )}
    </div>
  );
};
