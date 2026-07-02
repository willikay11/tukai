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
}

export const ItineraryDaysStep = ({
  experienceId,
  days,
  itineraryStartDate,
  onChange,
  onSaveContinue,
  onCancel,
  isSaving,
}: ItineraryDaysStepProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // Day 1 open by default

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
          <ItineraryDayPill
            key={day.id}
            day={day}
            isExpanded={expandedIndex === index}
            itineraryStartDate={itineraryStartDate}
            onToggle={() => handleToggle(index)}
            onChange={(data) => handleDayChange(index, data)}
            onDelete={() => handleDayDelete(index)}
          />
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between pt-4">
        <button type="button" onClick={onCancel} className="text-sm font-medium text-destructive">
          Cancel
        </button>
        <div className="flex gap-3">
          <Button type="button" variant="outline">
            Save & Exit
          </Button>
          <Button
            type="button"
            onClick={onSaveContinue}
            disabled={isSaving}
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
