export const getOrdinalDate = (dateString: string): string => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const getOrdinal = (num: number): string => {
      const j = num % 10;
      const k = num % 100;

      if (j === 1 && k !== 11) return `${num}st`;
      if (j === 2 && k !== 12) return `${num}nd`;
      if (j === 3 && k !== 13) return `${num}rd`;
      return `${num}th`;
    };

    const monthName = monthNames[date.getMonth()];
    const ordinalDay = getOrdinal(date.getDate());
    const year2 = date.getFullYear();

    return `${ordinalDay} ${monthName}, ${year2}`;
  } catch {
    return '';
  }
};

// → "Thursday, 19th March"
export const formatLongDateWithOrdinal = (date: Date): string => {
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
  const day = date.getDate();
  const month = date.toLocaleDateString('en-GB', { month: 'long' });

  const ordinal = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  return `${weekday}, ${day}${ordinal(day)} ${month}`;
};

// → "Sat 4 July"
export const formatShortDate = (isoString: string): string => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
  const month = date.toLocaleDateString('en-GB', { month: 'long' });

  return `${weekday} ${date.getDate()} ${month}`;
};

// start + end ISO → "Sat 4 July · 6:00 AM — 4:00 PM"
export const formatReservationDateTime = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const dayName = startDate.toLocaleDateString('en-GB', { weekday: 'short' });
  const day = startDate.getDate();
  const month = startDate.toLocaleDateString('en-GB', { month: 'long' });

  const time = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour = hours % 12 || 12;
    return `${hour}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  return `${dayName} ${day} ${month} · ${time(startDate)} — ${time(endDate)}`;
};

export const getDaysBetween = (startDate: string, endDate: string): string[] => {
  try {
    const days: string[] = [];
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

    const current = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    while (current <= end) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, '0');
      const day = String(current.getDate()).padStart(2, '0');
      days.push(`${year}-${month}-${day}`);
      current.setDate(current.getDate() + 1);
    }

    return days;
  } catch {
    return [];
  }
};

export const formatMultiDayRange = (startDate: string | null, endDate: string | null): string => {
  if (!startDate || !endDate) return '';

  try {
    const start = getOrdinalDate(startDate);
    const end = getOrdinalDate(endDate);
    return `${start} – ${end}`;
  } catch {
    return '';
  }
};

export const formatDateDDMMYYYY = (dateString: string | null): string => {
  if (!dateString) return '';

  try {
    const [year, month, day] = dateString.split('-').map(Number);
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  } catch {
    return '';
  }
};

export const formatTimeTo12Hour = (time: string): string => {
  if (!time) return '';

  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${displayHour}:${minutes} ${period}`;
  } catch {
    return '';
  }
};

export const formatDateForPreview = (isoString: string | null): string | null => {
  if (!isoString) return null;

  try {
    const date = new Date(isoString);
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const day = date.getUTCDate();
    const month = monthNames[date.getUTCMonth()];
    return `${day} ${month}`;
  } catch {
    return null;
  }
};

export const formatTimeForPreview = (isoString: string | null): string | null => {
  if (!isoString) return null;

  try {
    const date = new Date(isoString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const period = hours >= 12 ? 'PM' : 'AM';
    const paddedMinutes = String(minutes).padStart(2, '0');

    return `${displayHour}:${paddedMinutes} ${period}`;
  } catch {
    return null;
  }
};

export const formatFirstExperienceDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' });
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    return `${dayName} ${day}, ${month}`;
  } catch {
    return dateString;
  }
};

export const formatItineraryDateRange = (startDate: string, endDate: string): string => {
  try {
    const fmt = (d: string) => {
      const date = new Date(d);
      const day = date.getDate();
      const month = date.toLocaleDateString('en-GB', { month: 'short' });
      return `${day} ${month}`;
    };
    return `${fmt(startDate)} - ${fmt(endDate)}`;
  } catch {
    return `${startDate} - ${endDate}`;
  }
};

export const getNumberOfDaysAndNights = (
  startDate: string,
  endDate: string,
): { days: number; nights: number } => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // inclusive of start and end date
    const nights = days > 1 ? days - 1 : 0; // nights is one less than days, but minimum 0
    return { days, nights };
  } catch {
    return { days: 0, nights: 0 };
  }
};

export type UIExperienceType = 'one-time' | 'multi-day' | 'itinerary';

// Infer the UI experience type from the API response
export const inferUIExperienceType = (
  apiExperienceType: 'standard' | 'itinerary',
  startDate: string | null,
  endDate: string | null,
  isRecurring = false,
): UIExperienceType => {
  // Itinerary is always direct
  if (apiExperienceType === 'itinerary') {
    return 'itinerary';
  }

  // Recurring experiences use the 'one-time' base type with the isRecurring flag
  // layered on top. Their start/end span the first-to-last occurrence (often
  // several calendar days), so they must NOT be inferred as multi-day — doing so
  // routes the tickets step to the single-time multi-day layout instead of the
  // per-slot recurring layout.
  if (isRecurring) {
    return 'one-time';
  }

  // Standard — infer from date span
  if (!startDate || !endDate) {
    return 'one-time'; // default if dates missing
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Compare calendar dates only (ignore time)
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  return startDay.getTime() === endDay.getTime() ? 'one-time' : 'multi-day';
};

// → "Tue 17 Mar 2026 · 6:00 AM – 12:00 PM"
// Takes an ISO date plus already-formatted display times, which is the shape a
// booking confirmation carries. formatReservationDateTime is the two-ISO
// equivalent and is left alone for its existing callers.
export const formatBookingDateTime = (date: string, startTime: string, endTime: string): string => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';

  const weekday = parsed.toLocaleDateString('en-GB', { weekday: 'short' });
  const month = parsed.toLocaleDateString('en-GB', { month: 'short' });

  return `${weekday} ${parsed.getDate()} ${month} ${parsed.getFullYear()} · ${startTime} – ${endTime}`;
};

// → "11 Aug 2026, 9:07 AM"
export const formatPaidAt = (isoString: string): string => {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return '';

  const month = parsed.toLocaleDateString('en-GB', { month: 'short' });
  const hours = parsed.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return `${parsed.getDate()} ${month} ${parsed.getFullYear()}, ${displayHour}:${minutes} ${period}`;
};
