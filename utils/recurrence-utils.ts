const DAY_ABBREV: Record<string, string> = {
  MO: 'Mon',
  TU: 'Tue',
  WE: 'Wed',
  TH: 'Thu',
  FR: 'Fri',
  SA: 'Sat',
  SU: 'Sun',
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

export const formatDayLabel = (days: string[]): string => {
  const abbrevs = days.map((d) => DAY_ABBREV[d] ?? d);
  if (abbrevs.length === 0) return '';
  if (abbrevs.length === 1) return abbrevs[0];
  const last = abbrevs[abbrevs.length - 1];
  const rest = abbrevs.slice(0, -1);
  return `${rest.join(', ')} & ${last}`;
};
