'use client';

import { useState } from 'react';

import moment from 'moment';

import IconComponent from '@/app/components/iconComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type DayItem = {
  dayNumber: number;
  date: string;
  title: string;
  description: string;
  isExpanded: boolean;
};

export default function CustomiseItinerary({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const startMoment = moment(startDate, 'YYYY-MM-DD', true);
  const endMoment = moment(endDate, 'YYYY-MM-DD', true);
  const numDays = endMoment.diff(startMoment, 'days') + 1;

  const [days, setDays] = useState<DayItem[]>(() =>
    Array.from({ length: Math.max(numDays, 1) }, (_, i) => ({
      dayNumber: i + 1,
      date: startMoment.clone().add(i, 'days').format('YYYY-MM-DD'),
      title: '',
      description: '',
      isExpanded: i === 0,
    })),
  );

  const toggleDay = (dayNumber: number) => {
    setDays((prev) =>
      prev.map((day) =>
        day.dayNumber === dayNumber
          ? { ...day, isExpanded: !day.isExpanded }
          : { ...day, isExpanded: false },
      ),
    );
  };

  const collapseDay = (dayNumber: number) => {
    setDays((prev) =>
      prev.map((day) => (day.dayNumber === dayNumber ? { ...day, isExpanded: false } : day)),
    );
  };

  const updateDay = (
    dayNumber: number,
    update: Partial<Pick<DayItem, 'title' | 'description'>>,
  ) => {
    setDays((prev) =>
      prev.map((day) => (day.dayNumber === dayNumber ? { ...day, ...update } : day)),
    );
  };

  const removeDay = (dayNumber: number) => {
    setDays((prev) => prev.filter((day) => day.dayNumber !== dayNumber));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Customise Your Itinerary</h2>
        <p className="mt-1 text-xs text-gray-500">
          Add the days and the places you plan to visit
        </p>
      </div>

      <div className="relative">
        {/* Dashed vertical timeline line */}
        <div className="absolute bottom-4 left-[19px] top-4 border-l-2 border-dashed border-gray-300" />

        <div className="space-y-3">
          {days.map((day) => (
            <div key={day.dayNumber} className="relative pl-10">
              {/* Timeline dot */}
              <div className="absolute left-[13px] top-[13px] h-3 w-3 rounded-full border-2 border-gray-300 bg-white" />

              {day.isExpanded ? (
                <div className="space-y-3 rounded-2xl border border-gray-200 p-3">
                  {/* Expanded header */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDay(day.dayNumber)}
                      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5"
                    >
                      <IconComponent iconName="Calendar01Icon" size={14} color="#6B7280" />
                      <span className="text-xs font-medium text-gray-700">
                        Day {day.dayNumber}
                      </span>
                      <IconComponent iconName="ArrowUp01Icon" size={14} color="#6B7280" />
                    </button>

                    <button
                      type="button"
                      onClick={() => collapseDay(day.dayNumber)}
                      className="flex items-center gap-1 text-xs font-medium text-primary"
                    >
                      <IconComponent
                        iconName="CheckmarkCircle03Icon"
                        size={14}
                        color="currentColor"
                      />
                      Save Changes
                    </button>
                  </div>

                  {/* Activity Title */}
                  <Input
                    placeholder="Activity Title"
                    value={day.title}
                    onChange={(e) => updateDay(day.dayNumber, { title: e.target.value })}
                    className="rounded-xl border-gray-200 text-xs"
                  />

                  {/* Description */}
                  <Textarea
                    placeholder="Add a brief description about the day's experiences/activities"
                    value={day.description}
                    onChange={(e) => updateDay(day.dayNumber, { description: e.target.value })}
                    className="min-h-[100px] resize-none rounded-xl border-gray-200 text-xs"
                  />

                  {/* Add Place */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">
                      Where will these activities take place?
                    </p>
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-medium text-primary hover:bg-primary/5"
                    >
                      <IconComponent iconName="AddCircleIcon" size={16} color="currentColor" />
                      Add Place
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleDay(day.dayNumber)}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5"
                  >
                    <IconComponent iconName="Calendar01Icon" size={14} color="#6B7280" />
                    <span className="text-xs font-medium text-gray-700">Day {day.dayNumber}</span>
                    <IconComponent iconName="ArrowDown01Icon" size={14} color="#6B7280" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDay(day.dayNumber)}
                      className="hover:opacity-80"
                      aria-label={`Edit day ${day.dayNumber}`}
                    >
                      <IconComponent iconName="Edit02Icon" size={16} color="#22C55E" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeDay(day.dayNumber)}
                      className="hover:opacity-80"
                      aria-label={`Remove day ${day.dayNumber}`}
                    >
                      <IconComponent iconName="Delete02Icon" size={16} color="#EF4444" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button variant="gradient" className="rounded-full px-6 text-xs font-semibold text-white">
        Save Changes
      </Button>
    </div>
  );
}
