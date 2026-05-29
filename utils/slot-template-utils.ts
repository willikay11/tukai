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

export const buildSlotTemplatePayload = (
  slot: { startTime: string; endTime: string; name?: string },
  recurrenceRule?: string | null,
): SlotTemplatePayload => ({
  start_time: slot.startTime,
  duration_minutes: calculateDurationMinutes(slot.startTime, slot.endTime),
  name: slot.name ?? undefined,
  recurrence_rule: recurrenceRule ?? null,
});

export const slotTemplateToTimeSlot = (template: {
  id: string;
  startTime: string;
  durationMinutes: number;
  name?: string;
}) => ({
  id: template.id,
  startTime: template.startTime,
  endTime: calculateEndTime(template.startTime, template.durationMinutes),
  name: template.name,
});

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
      // New slot — create
      toCreate.push(slot);
    } else if (existing.startTime !== slot.startTime || existing.endTime !== slot.endTime) {
      // Changed slot — update
      toUpdate.push({ record: existing, ...slot });
    }
    // else: unchanged — skip
  });

  // Find records that no longer have a matching slot
  existingRecords.forEach((record, index) => {
    if (index >= currentSlots.length) {
      toDelete.push(record);
    }
  });

  return { toCreate, toUpdate, toDelete };
};
