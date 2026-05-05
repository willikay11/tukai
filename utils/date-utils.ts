
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
