import { RRule } from 'rrule';

import { localTimeToUtcTime, utcTimeToLocalTime } from './utc-time';

export interface SlotTemplatePayload {
  start_time: string;
  duration_minutes: number;
  recurrence_rule?: string | null;
  name?: string;
}

export interface SlotTemplateRecord {
  uiId: string;
  templateId: string;
  startTime: string;
  endTime: string;
  name?: string;
}

/**
 * A rule for one occurrence, starting at a local date and time. The Date is
 * built in local time, so RRule writes DTSTART as its true UTC instant.
 */
export const buildSingleOccurrenceRule = (startDate: string, startTime: string): string => {
  const [year, month, day] = startDate.split('-').map(Number);
  const [hour, minute] = startTime.split(':').map(Number);

  const rule = new RRule({
    freq: RRule.DAILY,
    count: 1,
    dtstart: new Date(year, month - 1, day, hour, minute, 0),
  });

  return rule.toString();
};

export const calculateDurationMinutes = (startTime: string, endTime: string): number => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startTotal = startHour * 60 + startMin;
  const endTotal = endHour * 60 + endMin;

  if (endTotal < startTotal) {
    return 24 * 60 - startTotal + endTotal;
  }
  return endTotal - startTotal;
};

export const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hour, min] = startTime.split(':').map(Number);
  const total = hour * 60 + min + durationMinutes;
  const endHour = Math.floor(total / 60) % 24;
  const endMin = total % 60;
  return `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
};

/**
 * The API body for a slot. `slot` holds local times; the API stores
 * `start_time` in UTC, converted on `localFirstDay` (the experience's first
 * day, `YYYY-MM-DD`), which is the day the backend places every slot on.
 * The length is the same in either zone.
 */
export const buildSlotTemplatePayload = (
  slot: { startTime: string; endTime: string; name?: string },
  recurrenceRule: string | null | undefined,
  localFirstDay: string,
): SlotTemplatePayload => ({
  start_time: localTimeToUtcTime(localFirstDay, slot.startTime),
  duration_minutes: calculateDurationMinutes(slot.startTime, slot.endTime),
  name: slot.name ?? undefined,
  recurrence_rule: recurrenceRule ?? null,
});

/**
 * A slot template from the API as the local times the form shows.
 * `utcFirstDay` is the UTC date of the experience's start.
 */
export const slotTemplateToTimeSlot = (
  template: {
    id: string;
    startTime: string;
    durationMinutes: number;
    name?: string;
  },
  utcFirstDay: string,
) => {
  const startTime = utcTimeToLocalTime(utcFirstDay, template.startTime);
  return {
    id: template.id,
    startTime,
    endTime: calculateEndTime(startTime, template.durationMinutes),
    name: template.name,
  };
};

export const diffSlotTemplates = (
  currentSlots: { startTime: string; endTime: string }[],
  existingRecords: SlotTemplateRecord[],
): {
  toCreate: { startTime: string; endTime: string }[];
  toUpdate: { record: SlotTemplateRecord; startTime: string; endTime: string }[];
  toDelete: SlotTemplateRecord[];
} => {
  const toCreate: { startTime: string; endTime: string }[] = [];
  const toUpdate: {
    record: SlotTemplateRecord;
    startTime: string;
    endTime: string;
  }[] = [];
  const toDelete: SlotTemplateRecord[] = [];

  // Find slots that need creating or updating
  currentSlots.forEach((slot, index) => {
    const existing = existingRecords[index];
    if (!existing) {
      // New slot - create
      toCreate.push(slot);
    } else if (existing.startTime !== slot.startTime || existing.endTime !== slot.endTime) {
      // Changed slot - update
      toUpdate.push({ record: existing, ...slot });
    }
    // else: unchanged - skip
  });

  // Find records that no longer have a matching slot
  existingRecords.forEach((record, index) => {
    if (index >= currentSlots.length) {
      toDelete.push(record);
    }
  });

  return { toCreate, toUpdate, toDelete };
};
