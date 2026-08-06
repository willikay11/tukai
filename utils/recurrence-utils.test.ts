import { formatDayLabel, formatFullDayLabel, parseRecurrenceRule } from './recurrence-utils';

describe('recurrence-utils', () => {
  describe('formatDayLabel', () => {
    it('joins abbreviated day names', () => {
      expect(formatDayLabel(['mon', 'wed', 'fri'])).toBe('Mon, Wed & Fri');
    });

    it('returns a single day unjoined', () => {
      expect(formatDayLabel(['sat'])).toBe('Sat');
    });

    it('returns an empty string for no days', () => {
      expect(formatDayLabel([])).toBe('');
    });
  });

  describe('formatFullDayLabel', () => {
    it('joins full day names, as the booking panel does', () => {
      expect(formatFullDayLabel(['mon', 'wed', 'fri'])).toBe('Monday, Wednesday & Friday');
    });

    it('passes through names it does not recognise', () => {
      expect(formatFullDayLabel(['Monday', 'Friday'])).toBe('Monday & Friday');
    });
  });

  describe('parseRecurrenceRule', () => {
    // RRule weekday numbers start at Monday, not Sunday — MO=0 must map to 'mon'
    it('maps RRule weekdays to the right day keys', () => {
      const parsed = parseRecurrenceRule(
        'DTSTART:20260601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20260831T235959Z',
      );

      expect(parsed?.days).toEqual(['mon', 'wed', 'fri']);
    });

    it('maps Sunday to the last key rather than the first', () => {
      const parsed = parseRecurrenceRule(
        'DTSTART:20260601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=SU;UNTIL=20260831T235959Z',
      );

      expect(parsed?.days).toEqual(['sun']);
    });

    it('extracts the recurrence date range', () => {
      const parsed = parseRecurrenceRule(
        'DTSTART:20260601T090000Z\nRRULE:FREQ=WEEKLY;BYDAY=MO;UNTIL=20260831T235959Z',
      );

      expect(parsed?.startDate).toBe('2026-06-01');
      expect(parsed?.endDate).toBe('2026-08-31');
    });

    it('returns null for an unparseable rule', () => {
      expect(parseRecurrenceRule('not-a-rule')).toBeNull();
    });
  });
});
