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
