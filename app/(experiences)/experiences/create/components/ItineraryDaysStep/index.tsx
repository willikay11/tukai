'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ItineraryDayFormValue } from '@/types/itinerary';

import { ItineraryDayPill } from '../ItineraryDayPill';

interface ItineraryDaysStepProps {
  experienceId: string;
  days: ItineraryDayFormValue[];
  itineraryStartDate: string | null;
  onChange: (days: ItineraryDayFormValue[]) => void;
  onSaveContinue: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isParentSaving?: boolean;
  registerFlusher?: (
    dayId: string,
    flusher: () => { title?: string; description?: string },
  ) => () => void;
}

export const ItineraryDaysStep = ({
  experienceId,
  days,
  itineraryStartDate,
  onChange,
  onSaveContinue,
  onCancel,
  isSaving,
  isParentSaving = false,
  registerFlusher,
}: ItineraryDaysStepProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // Day 1 open by default

  // Completeness check: all days must have at least one saved activity
  const daysWithActivities = days.filter((day) =>
    day.activities.some((a) => a.activityApiId != null),
  ).length;

  const totalDays = days.length;

  const allDaysHaveActivities = totalDays > 0 && daysWithActivities === totalDays;

  const incompleteDays = days
    .filter((day) => !day.activities.some((a) => a.activityApiId != null))
    .map((day) => day.dayNumber);

  const scrollToDay = (dayNumber: number) => {
    const element = document.getElementById(`itinerary-day-${dayNumber}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  const handleToggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const handleDayChange = (index: number, data: Partial<ItineraryDayFormValue>) => {
    const updated = [...days];
    updated[index] = { ...updated[index], ...data };
    onChange(updated);
  };

  const handleDayDelete = (index: number) => {
    // Renumber remaining days
    const updated = days
      .filter((_, i) => i !== index)
      .map((day, i) => ({ ...day, dayNumber: i + 1 }));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800">Customise Your Itinerary</h2>
        <p className="mt-1 text-xs text-gray-800">Add the days and the places you plan to visit</p>
      </div>

      {/* Day pills */}
      <div className="mt-4">
        {days.map((day, index) => (
          <div key={day.id} id={`itinerary-day-${day.dayNumber}`}>
            <ItineraryDayPill
              day={day}
              isExpanded={expandedIndex === index}
              itineraryStartDate={itineraryStartDate}
              experienceId={experienceId}
              onToggle={() => handleToggle(index)}
              onChange={(data) => handleDayChange(index, data)}
              onDelete={() => handleDayDelete(index)}
              isParentSaving={isParentSaving}
              registerFlusher={registerFlusher}
            />
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      {!allDaysHaveActivities && (
        <p className="text-center text-xs text-muted-foreground">
          {daysWithActivities} of {totalDays} days have activities — add at least one activity to{' '}
          <button
            type="button"
            onClick={() => incompleteDays.length > 0 && scrollToDay(incompleteDays[0])}
            className="text-primary underline hover:no-underline"
          >
            {incompleteDays.length === 1
              ? `Day ${incompleteDays[0]}`
              : incompleteDays.length <= 3
                ? `Days ${incompleteDays.join(', ')}`
                : `${incompleteDays.length} remaining days`}
          </button>
          {' to continue'}
        </p>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between pt-4">
        <button type="button" onClick={onCancel} className="text-sm font-medium text-destructive">
          Cancel
        </button>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="rounded-full">
            Save & Exit
          </Button>
          <Button
            type="button"
            onClick={onSaveContinue}
            disabled={isSaving || !allDaysHaveActivities}
            variant="gradient"
            className="rounded-full"
          >
            {isSaving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};
