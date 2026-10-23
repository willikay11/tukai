'use client';

import { useState } from 'react';

import { format } from 'date-fns';

import { DateField, TimeField } from '@/app/shared/components/Forms';
import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';
import type { ItineraryActivity } from '@/types/itinerary';

interface ItineraryStopProps {
  stop: ItineraryActivity;
  date: Date | null;
  isSpecificDates: boolean;
  isDragging: boolean;
  isDropBefore: boolean;
  isDropAfter: boolean;
  draggable: boolean;
  takenTimes: { time: string; label: string }[];
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onChange: (patch: Partial<ItineraryActivity>) => void;
  onRemove: () => void;
  // Alt+ArrowUp / Alt+ArrowDown reordering (the keyboard counterpart to drag),
  // only wired when there's somewhere for the stop to move to.
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

/** One tk-stop row inside a day: place thumbnail, name, time range, inline time editor. */
export const ItineraryStop = ({
  stop,
  date,
  isSpecificDates,
  isDragging,
  isDropBefore,
  isDropAfter,
  draggable,
  takenTimes,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: ItineraryStopProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const hasClash = takenTimes.some(
    (taken) => stop.startTime && stop.endTime && taken.time === stop.startTime,
  );

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      tabIndex={draggable ? 0 : undefined}
      aria-label={
        draggable
          ? `${stop.placeName ?? 'Place'}. Hold and drag, or use Alt plus the arrow keys, to reorder.`
          : undefined
      }
      onKeyDown={(e) => {
        if (!e.altKey) return;
        if (e.key === 'ArrowUp' && onMoveUp) {
          e.preventDefault();
          onMoveUp();
        } else if (e.key === 'ArrowDown' && onMoveDown) {
          e.preventDefault();
          onMoveDown();
        }
      }}
      className={cn(
        'relative flex flex-col gap-3 rounded-xl bg-white p-2.5 outline-none transition-shadow',
        draggable && 'cursor-grab select-none focus:shadow-[inset_0_0_0_2px_#066349]',
        isDragging && 'z-[3] cursor-grabbing shadow-[0_14px_30px_rgba(1,51,52,.22)]',
      )}
    >
      {isDropBefore && (
        <span className="absolute -top-[7px] left-2.5 right-2.5 h-[3px] rounded-full bg-brand" />
      )}
      {isDropAfter && (
        <span className="absolute -bottom-[7px] left-2.5 right-2.5 h-[3px] rounded-full bg-brand" />
      )}

      <div className="flex items-center gap-3.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stop.placeImageUrl ?? undefined}
          alt=""
          draggable={false}
          className="h-[72px] w-[72px] flex-shrink-0 rounded-xl bg-surface-brand object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <button
            type="button"
            aria-label={`View ${stop.placeName ?? 'place'}`}
            className="inline-flex min-h-10 max-w-full items-center gap-1.5 self-start text-left text-[15.5px] font-semibold text-gray-800 hover:text-brand"
          >
            <span className="min-w-0 truncate">{stop.placeName ?? 'Untitled place'}</span>
            <IconComponent iconName="ArrowUpRight01Icon" size={17} color="#066349" />
          </button>
          <button
            type="button"
            aria-expanded={isEditing}
            onClick={() => setIsEditing((open) => !open)}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-ink"
          >
            {isSpecificDates && date && <span>{format(date, 'EEE d MMM')}</span>}
            {isSpecificDates && date && <span className="h-[5px] w-[5px] rounded-full bg-[#B7C3BE]" />}
            <span
              className={cn(
                'text-ink',
                !stop.startTime && 'text-amber-700',
                hasClash && 'text-danger-deep',
              )}
            >
              {stop.startTime && stop.endTime
                ? `${stop.startTime} - ${stop.endTime}${hasClash ? `, clashes with ${takenTimes[0]?.label}` : ''}`
                : 'Add a time'}
            </span>
            <IconComponent iconName="Edit02Icon" size={18} color="#066349" />
          </button>
        </div>
        <button
          type="button"
          aria-label={`Remove ${stop.placeName ?? 'place'} from this day`}
          onClick={onRemove}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-danger hover:bg-[#FDE8E8]"
        >
          <IconComponent iconName="Delete02Icon" size={21} color="currentColor" />
        </button>
      </div>

      {isEditing && (
        <div className="flex flex-col gap-2.5 rounded-xl bg-[#F7F8F7] p-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
            {/* Specific-dates only: the activity type has no date of its own
                yet (see types/itinerary.ts), so this stays pinned to the
                day's own date rather than offering a different one. */}
            {isSpecificDates && (
              <DateField label="Date" value={date ? format(date, 'yyyy-MM-dd') : null} onChange={() => {}} disabled />
            )}
            <TimeField
              label="Start time"
              value={stop.startTime}
              onChange={(value) => onChange({ startTime: value })}
              takenTimes={takenTimes}
            />
            <TimeField
              label="End time"
              value={stop.endTime}
              onChange={(value) => onChange({ endTime: value })}
              afterTime={stop.startTime}
              takenTimes={takenTimes}
            />
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="h-11 self-end rounded-full bg-brand-ink px-[22px] text-[14.5px] font-semibold text-white hover:bg-brand"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};
