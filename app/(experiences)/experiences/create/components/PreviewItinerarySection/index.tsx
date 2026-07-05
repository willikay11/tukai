'use client';

import { useState } from 'react';

import { ItineraryDayFormValue } from '@/types/itinerary';
import { PreviewItineraryDayPill } from '../PreviewItineraryDayPill';

interface PreviewItinerarySectionProps {
  days: ItineraryDayFormValue[];
  itineraryStartDate: string | null;
  onEditDay?: (dayNumber: number) => void;
}

export const PreviewItinerarySection = ({
  days,
  itineraryStartDate,
  onEditDay,
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
    if (!itineraryStartDate) return null;
    const start = new Date(itineraryStartDate);
    start.setDate(start.getDate() + dayNumber - 1);
    return start.toISOString().split('T')[0];
  };

  if (days.length === 0) {
    return <p className="italic text-gray-500">No itinerary days yet</p>;
  }

  return (
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
          onEdit={() => onEditDay?.(day.dayNumber)}
          isLast={index === days.length - 1}
        />
      ))}
    </div>
  );
};
