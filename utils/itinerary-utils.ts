export interface TimeRange {
  startTime: string | null; // "HH:MM"
  endTime: string | null;
}

// Convert "HH:MM" to minutes since midnight
const toMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// Check if two time ranges overlap
// (both must have complete times)
export const doTimesOverlap = (a: TimeRange, b: TimeRange): boolean => {
  if (!a.startTime || !a.endTime) return false;
  if (!b.startTime || !b.endTime) return false;

  const aStart = toMinutes(a.startTime);
  const aEnd = toMinutes(a.endTime);
  const bStart = toMinutes(b.startTime);
  const bEnd = toMinutes(b.endTime);

  // Overlap when ranges intersect [start, end)
  return aStart < bEnd && bStart < aEnd;
};

// Find any activity that overlaps with the given one
// (excluding the activity itself by id)
export const findOverlappingActivity = (
  target: {
    id: string;
    startTime: string | null;
    endTime: string | null;
  },
  activities: Array<{
    id: string;
    startTime: string | null;
    endTime: string | null;
    title?: string;
    placeName?: string | null;
  }>,
): (typeof activities)[number] | null => {
  if (!target.startTime || !target.endTime) return null;

  for (const other of activities) {
    if (other.id === target.id) continue;
    if (doTimesOverlap(target, other)) {
      return other;
    }
  }
  return null;
};

// Validate that end is after start on the activity itself
export const isEndAfterStart = (
  startTime: string | null,
  endTime: string | null,
): boolean => {
  if (!startTime || !endTime) return true; // incomplete = valid so far
  return toMinutes(endTime) > toMinutes(startTime);
};
