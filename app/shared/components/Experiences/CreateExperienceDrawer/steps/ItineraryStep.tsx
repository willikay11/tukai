'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { format, isAfter, parseISO } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import type { useCreateExperienceFlow } from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { cn } from '@/lib/utils';
import {
  createItineraryDayActivity,
  deleteItineraryDayActivity,
  updateItineraryDayActivity,
  updateItineraryDayMetadata,
} from '@/services/experience';
import { itineraryDayDate, type ItineraryActivity, type ItineraryDayFormValue } from '@/types/itinerary';
import { getDaysBetween } from '@/utils/date-utils';
import { parseApiError } from '@/utils/parseApiError';

import { ItineraryStop } from './ItineraryStop';

type Flow = ReturnType<typeof useCreateExperienceFlow>;

export interface PickedPlace {
  id: string;
  name: string;
  imageUrl: string | null;
  city: string | null;
  locationId?: string | null;
  source: 'tukai' | 'google';
}

interface ItineraryStepProps {
  flow: Flow;
  onRequestAddPlaces: (opts: {
    dayId: string;
    alreadySelectedPlaceIds: string[];
  }) => Promise<PickedPlace[] | null>;
}

const newDay = (dayNumber: number): ItineraryDayFormValue => ({
  id: uuidv4(),
  apiId: '',
  dayNumber,
  title: '',
  description: '',
  activities: [],
});

/**
 * Step 3: Itinerary (itinerary experiences only). Day-level title/
 * description/add/remove already persists through
 * `flow.handlers.handleSaveItineraryDays` - this step only has to keep
 * `flow.formData.itineraryDays` correct by the time that runs.
 *
 * Stops (activities) are new: `createItineraryDayActivity` /
 * `updateItineraryDayActivity` / `deleteItineraryDayActivity` exist in
 * services/experience.ts but nothing called them before this. They're
 * called directly here (optimistic local update + API call) rather than
 * added to `useCreateExperienceFlow`, which the full-page /experiences/create
 * route also depends on unchanged.
 *
 * Day count is derived from the date range in Date & type
 * (`itineraryStartDate`/`itineraryEndDate`); "Add/remove a day" here moves
 * that end date by one day (via `flow.updateFormData`) rather than only
 * touching the local day array, matching "Adding or removing a day moves
 * the end date" in the handoff.
 */
export const ItineraryStep = ({ flow, onRequestAddPlaces }: ItineraryStepProps) => {
  const { toast } = useToast();
  const [openDayId, setOpenDayId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ dayId: string; fromIndex: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ dayId: string; index: number } | null>(null);

  const { itineraryDays: days } = flow.formData;
  const { itineraryStartDate, itineraryEndDate } = flow.formData.dateType;
  const isSpecificDates = Boolean(itineraryStartDate && itineraryEndDate);

  // Seeds the day list from the date range the first time this step is
  // opened with dates already set but no days yet - the hook itself no
  // longer auto-regenerates this (it wiped filled-in days on every date
  // tweak), so seeding happens once, here, not reactively.
  useEffect(() => {
    if (days.length > 0 || !itineraryStartDate || !itineraryEndDate) return;
    const dates = getDaysBetween(itineraryStartDate, itineraryEndDate);
    if (dates.length === 0) return;
    flow.updateItineraryDays(dates.map((_, index) => newDay(index + 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itineraryStartDate, itineraryEndDate, days.length]);

  useEffect(() => {
    if (openDayId === null && days.length > 0) setOpenDayId(days[0].id);
  }, [openDayId, days.length]);

  const updateDay = (dayId: string, patch: Partial<ItineraryDayFormValue>) => {
    flow.updateItineraryDays(days.map((day) => (day.id === dayId ? { ...day, ...patch } : day)));
  };

  // ─── Day title/description debounced autosave ──────────────────────────
  // Keyed by apiId, exactly like the old ItineraryDayPill: a keystroke
  // updates form state immediately (above) and schedules a PATCH 800ms
  // later; `registerFlusher` lets handleSaveItineraryDays cancel that timer
  // and fold whatever's pending into its own bulk save when "Save &
  // continue" is pressed before the debounce fires.
  const pendingDataRef = useRef<Map<string, { title?: string; description?: string }>>(new Map());
  const saveTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const performSave = useCallback(
    async (dayApiId: string, dayNumber: number, fallbackTitle: string, fallbackDescription: string) => {
      const pending = pendingDataRef.current.get(dayApiId);
      if (!flow.experienceId || !pending) return;
      pendingDataRef.current.delete(dayApiId);
      try {
        await updateItineraryDayMetadata(flow.experienceId, dayApiId, {
          day_number: dayNumber,
          title: pending.title ?? fallbackTitle,
          description: pending.description ?? fallbackDescription,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: parseApiError(error, 'Failed to save the day'),
          variant: 'destructive',
        });
      }
    },
    [flow.experienceId, toast],
  );

  const scheduleDebouncedSave = useCallback(
    (day: ItineraryDayFormValue) => {
      if (!day.apiId) return;
      const existing = saveTimersRef.current.get(day.apiId);
      if (existing) clearTimeout(existing);
      saveTimersRef.current.set(
        day.apiId,
        setTimeout(() => {
          saveTimersRef.current.delete(day.apiId);
          performSave(day.apiId, day.dayNumber, day.title, day.description);
        }, 800),
      );
    },
    [performSave],
  );

  const flushPendingSave = useCallback((day: ItineraryDayFormValue) => {
    if (!day.apiId) return;
    const timer = saveTimersRef.current.get(day.apiId);
    if (timer) {
      clearTimeout(timer);
      saveTimersRef.current.delete(day.apiId);
      performSave(day.apiId, day.dayNumber, day.title, day.description);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDayFieldChange = (day: ItineraryDayFormValue, patch: { title?: string; description?: string }) => {
    updateDay(day.id, patch);
    if (!day.apiId) return;
    const pending = pendingDataRef.current.get(day.apiId) ?? {};
    pendingDataRef.current.set(day.apiId, { ...pending, ...patch });
    scheduleDebouncedSave({ ...day, ...patch });
  };

  // Registers one flusher per persisted day so handleSaveItineraryDays can
  // flush a still-debouncing edit synchronously before its own bulk save.
  const apiIdsKey = days.map((day) => day.apiId).join(',');
  useEffect(() => {
    const unregisterFns = days
      .filter((day) => day.apiId)
      .map((day) =>
        flow.registerFlusher(day.apiId, () => {
          const pending = pendingDataRef.current.get(day.apiId) ?? {};
          pendingDataRef.current.delete(day.apiId);
          const timer = saveTimersRef.current.get(day.apiId);
          if (timer) {
            clearTimeout(timer);
            saveTimersRef.current.delete(day.apiId);
          }
          return pending;
        }),
      );
    return () => unregisterFns.forEach((unregister) => unregister());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiIdsKey, flow.registerFlusher]);

  // Flush the day being closed - either by collapsing it or by opening a
  // different one - so a pending edit isn't lost to an unmount/collapse
  // racing the 800ms timer.
  const handleToggleDay = (day: ItineraryDayFormValue) => {
    if (openDayId === day.id) {
      flushPendingSave(day);
      setOpenDayId(null);
    } else {
      const previouslyOpen = days.find((d) => d.id === openDayId);
      if (previouslyOpen) flushPendingSave(previouslyOpen);
      setOpenDayId(day.id);
    }
  };

  // Flush everything still pending on unmount (e.g. the drawer is closed).
  useEffect(() => {
    return () => {
      saveTimersRef.current.forEach((timer) => clearTimeout(timer));
      days.forEach((day) => {
        if (pendingDataRef.current.has(day.apiId)) {
          performSave(day.apiId, day.dayNumber, day.title, day.description);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddDay = () => {
    const nextDayNumber = days.length + 1;
    flow.updateItineraryDays([...days, newDay(nextDayNumber)]);
    if (itineraryStartDate) {
      const nextEnd = itineraryDayDate(itineraryStartDate, nextDayNumber);
      if (nextEnd) flow.updateFormData({ itineraryEndDate: format(nextEnd, 'yyyy-MM-dd') });
    }
    toast({
      title: `Day ${nextDayNumber} added.`,
      description: itineraryStartDate
        ? `The end date is now ${format(itineraryDayDate(itineraryStartDate, nextDayNumber) ?? new Date(), 'EEE d MMM')}.`
        : undefined,
    });
  };

  const handleRemoveDay = async (day: ItineraryDayFormValue) => {
    if (days.length <= 1) {
      flow.updateItineraryDays([]);
      toast({ title: 'Day 1 cleared.' });
      return;
    }

    if (day.apiId) {
      const deleted = await flow.handlers.handleDeleteItineraryDay(day.id);
      if (!deleted) return;
    } else {
      flow.updateItineraryDays(
        days.filter((d) => d.id !== day.id).map((d, index) => ({ ...d, dayNumber: index + 1 })),
      );
    }

    const remaining = days.length - 1;
    if (itineraryStartDate) {
      const nextEnd = itineraryDayDate(itineraryStartDate, remaining);
      if (nextEnd) flow.updateFormData({ itineraryEndDate: format(nextEnd, 'yyyy-MM-dd') });
    }
    toast({
      title: `Day ${day.dayNumber} removed.`,
      description: itineraryStartDate
        ? `The end date is now ${format(itineraryDayDate(itineraryStartDate, remaining) ?? new Date(), 'EEE d MMM')}.`
        : undefined,
    });
  };

  const handleAddPlaces = async (day: ItineraryDayFormValue) => {
    const picked = await onRequestAddPlaces({
      dayId: day.id,
      alreadySelectedPlaceIds: day.activities.map((a) => a.placeId).filter(Boolean) as string[],
    });
    if (!picked || picked.length === 0) return;

    const newActivities: ItineraryActivity[] = picked.map((place) => ({
      id: uuidv4(),
      title: place.name,
      description: '',
      placeId: place.source === 'tukai' ? place.id : null,
      placeName: place.name,
      placeImageUrl: place.imageUrl,
      placeCity: place.city,
      locationId: place.locationId ?? null,
      startTime: null,
      endTime: null,
    }));

    updateDay(day.id, { activities: [...day.activities, ...newActivities] });

    if (flow.experienceId && day.apiId) {
      try {
        await Promise.all(
          newActivities.map((activity, index) =>
            createItineraryDayActivity(flow.experienceId as string, day.apiId, {
              title: activity.title,
              description: activity.description,
              place_id: activity.placeId ?? undefined,
              location: activity.locationId ?? undefined,
              order: day.activities.length + index,
            }).then((response) => {
              const apiId = (response.data as { id?: string })?.id;
              if (apiId) {
                updateDay(day.id, {
                  activities: days
                    .find((d) => d.id === day.id)!
                    .activities.map((a) =>
                      a.id === activity.id ? { ...a, activityApiId: apiId } : a,
                    ),
                });
              }
            }),
          ),
        );
      } catch (error) {
        toast({
          title: 'Error',
          description: parseApiError(error, 'Failed to save the new places'),
          variant: 'destructive',
        });
      }
    }

    toast({
      title:
        picked.length === 1
          ? `One place added to Day ${day.dayNumber}. Add a time for each.`
          : `${picked.length} places added to Day ${day.dayNumber}. Add a time for each.`,
    });
  };

  const handleRemoveStop = async (day: ItineraryDayFormValue, stop: ItineraryActivity) => {
    updateDay(day.id, { activities: day.activities.filter((a) => a.id !== stop.id) });
    if (flow.experienceId && day.apiId && stop.activityApiId) {
      try {
        await deleteItineraryDayActivity(flow.experienceId, day.apiId, stop.activityApiId);
      } catch (error) {
        toast({
          title: 'Error',
          description: parseApiError(error, 'Failed to remove the place'),
          variant: 'destructive',
        });
      }
    }
  };

  const handleStopChange = async (
    day: ItineraryDayFormValue,
    stop: ItineraryActivity,
    patch: Partial<ItineraryActivity>,
  ) => {
    updateDay(day.id, {
      activities: day.activities.map((a) => (a.id === stop.id ? { ...a, ...patch } : a)),
    });
    if (flow.experienceId && day.apiId && stop.activityApiId) {
      try {
        await updateItineraryDayActivity(flow.experienceId, day.apiId, stop.activityApiId, {
          start_time: patch.startTime ?? undefined,
          end_time: patch.endTime ?? undefined,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: parseApiError(error, 'Failed to save the time'),
          variant: 'destructive',
        });
      }
    }
  };

  const persistOrder = async (day: ItineraryDayFormValue, activities: ItineraryActivity[]) => {
    updateDay(day.id, { activities });
    if (!flow.experienceId || !day.apiId) return;
    try {
      await Promise.all(
        activities.map((activity, index) =>
          activity.activityApiId
            ? updateItineraryDayActivity(flow.experienceId as string, day.apiId, activity.activityApiId, {
                order: index,
              })
            : Promise.resolve(),
        ),
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: parseApiError(error, 'Failed to save the new order'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-2.5">
        <h2 className="text-22 font-bold leading-tight tracking-[-0.3px] text-gray-800">
          Customise your itinerary
        </h2>
        <p className="text-15 leading-relaxed text-ink">Add the days and the places you plan to visit.</p>
        <p className="text-sm leading-relaxed text-ink-muted">
          {itineraryStartDate
            ? "Each day takes its date from the start date in Date & type. Adding or removing a day moves the end date."
            : 'Add a start date in Date & type and each day will show its date.'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {days.map((day) => {
          const isOpen = openDayId === day.id;
          const date = isSpecificDates ? itineraryDayDate(itineraryStartDate, day.dayNumber) : null;
          const isOutsideDates =
            Boolean(date && itineraryEndDate) &&
            isAfter(date as Date, parseISO(itineraryEndDate as string));

          return (
            <div key={day.id} className="flex flex-col rounded-xl bg-surface">
              <div className="flex items-center gap-0.5 p-1.5">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => handleToggleDay(day)}
                  className="flex min-h-13 flex-1 items-center gap-2.5 rounded-xl px-2.5 text-left"
                >
                  <IconComponent
                    iconName={isOpen ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
                    size={20}
                    color="#1F2937"
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[16.5px] font-bold text-gray-800">
                      Day {day.dayNumber}
                      {date ? `: ${format(date, 'EEE d MMM')}` : ''}
                    </span>
                    {isOutsideDates && (
                      <span className="text-13 font-medium text-amber-700">
                        Outside your dates. Remove this day or change the end date.
                      </span>
                    )}
                  </span>
                  <span className="flex-shrink-0 whitespace-nowrap text-[13.5px] text-ink-muted">
                    {day.activities.length} {day.activities.length === 1 ? 'place' : 'places'} added
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`Remove Day ${day.dayNumber}`}
                  onClick={() => handleRemoveDay(day)}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-danger hover:bg-[#FDE8E8]"
                >
                  <IconComponent iconName="Delete02Icon" size={21} color="currentColor" />
                </button>
              </div>

              {isOpen && (
                <div className="flex flex-col gap-3.5 px-[18px] pb-5 pt-1">
                  <label className="flex flex-col gap-2">
                    <span className="text-15 font-semibold text-gray-800">Activity title</span>
                    <input
                      value={day.title}
                      onChange={(e) => handleDayFieldChange(day, { title: e.target.value })}
                      placeholder="Add the activity title"
                      className="h-14 rounded-xl border border-line bg-white px-4 text-15 text-gray-800 outline-none focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]"
                    />
                  </label>
                  <textarea
                    value={day.description}
                    onChange={(e) => handleDayFieldChange(day, { description: e.target.value })}
                    rows={3}
                    aria-label={`Description for Day ${day.dayNumber}`}
                    placeholder="Add a brief description of the day's activities"
                    className="min-h-[110px] rounded-xl border border-line bg-white p-4 text-15 leading-relaxed text-gray-800 outline-none focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]"
                  />

                  <span className="text-15 font-semibold text-gray-800">
                    Where will these activities take place?
                  </span>

                  <div className="flex flex-col gap-2.5">
                    {day.activities.map((stop, index) => {
                      const takenTimes = day.activities
                        .filter((other) => other.id !== stop.id && other.startTime)
                        .map((other) => ({ time: other.startTime as string, label: other.placeName ?? 'another place' }));

                      return (
                        <ItineraryStop
                          key={stop.id}
                          stop={stop}
                          date={date}
                          isSpecificDates={isSpecificDates}
                          draggable={day.activities.length > 1}
                          isDragging={dragState?.dayId === day.id && dragState.fromIndex === index}
                          isDropBefore={dropTarget?.dayId === day.id && dropTarget.index === index}
                          isDropAfter={false}
                          takenTimes={takenTimes}
                          onDragStart={() => setDragState({ dayId: day.id, fromIndex: index })}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDropTarget({ dayId: day.id, index });
                          }}
                          onDrop={() => {
                            if (dragState && dragState.dayId === day.id) {
                              const next = [...day.activities];
                              const [moved] = next.splice(dragState.fromIndex, 1);
                              next.splice(index, 0, moved);
                              persistOrder(day, next);
                            }
                            setDragState(null);
                            setDropTarget(null);
                          }}
                          onDragEnd={() => {
                            setDragState(null);
                            setDropTarget(null);
                          }}
                          onChange={(patch) => handleStopChange(day, stop, patch)}
                          onRemove={() => handleRemoveStop(day, stop)}
                          onMoveUp={
                            index > 0
                              ? () => {
                                  const next = [...day.activities];
                                  const [moved] = next.splice(index, 1);
                                  next.splice(index - 1, 0, moved);
                                  persistOrder(day, next);
                                }
                              : undefined
                          }
                          onMoveDown={
                            index < day.activities.length - 1
                              ? () => {
                                  const next = [...day.activities];
                                  const [moved] = next.splice(index, 1);
                                  next.splice(index + 1, 0, moved);
                                  persistOrder(day, next);
                                }
                              : undefined
                          }
                        />
                      );
                    })}
                  </div>

                  {day.activities.length > 1 && (
                    <span className="text-[13px] leading-tight text-ink-muted">
                      Hold and drag a place to reorder it.
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAddPlaces(day)}
                    className={cn(
                      'inline-flex h-12 items-center gap-2.5 self-start rounded-full bg-lime pl-4 pr-[22px] text-[15px] font-semibold text-brand-ink hover:bg-lime-dark',
                    )}
                  >
                    <IconComponent iconName="AddCircleIcon" size={22} color="currentColor" />
                    Add place
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleAddDay}
        className="-mt-1.5 inline-flex min-h-11 items-center gap-2 self-start text-15 font-semibold text-brand hover:underline"
      >
        <IconComponent iconName="CalendarAdd01Icon" size={20} color="#066349" />
        Add another day
      </button>
    </div>
  );
};
