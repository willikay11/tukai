'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { ItineraryDayFormValue } from '@/types/itinerary';

import { PreviewItineraryDayPill } from '../PreviewItineraryDayPill';

interface PreviewItinerarySectionProps {
  days: ItineraryDayFormValue[];
  itineraryStartDate: string | null;
  onEdit?: () => void;
}

export const PreviewItinerarySection = ({
  days,
  itineraryStartDate,
  onEdit,
}: PreviewItinerarySectionProps) => {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNumber)) {
        next.delete(dayNumber);
      } else {
        next.add(dayNumber);
      }
      return next;
    });
  };

  const getDayDate = (dayNumber: number): string | null => {
    if (!itineraryStartDate || !Number.isFinite(dayNumber)) return null;
    const start = new Date(itineraryStartDate);
    start.setDate(start.getDate() + dayNumber - 1);
    // An unparseable start date (or bad day number) yields an Invalid Date,
    // where toISOString() throws a RangeError
    if (Number.isNaN(start.getTime())) return null;
    return start.toISOString().split('T')[0];
  };

  if (days.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* The day pills stay read-only; only the heading carries the edit
          affordance, which jumps to the itinerary step */}
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-800">Itinerary</p>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
          </button>
        )}
      </div>

      {/* Day pills */}
      <div className="space-y-1">
        {days.map((day, index) => (
          <PreviewItineraryDayPill
            key={day.id}
            dayNumber={day.dayNumber}
            title={day.title}
            description={day.description}
            activities={day.activities}
            dayDate={getDayDate(day.dayNumber)}
            isExpanded={expandedDays.has(day.dayNumber)}
            onToggle={() => toggleDay(day.dayNumber)}
            isLast={index === days.length - 1}
          />
        ))}
      </div>
    </div>
  );
};
