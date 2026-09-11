import { formatOpenHours, parseOpenHours } from './PlaceHoursFields';

describe('open hours', () => {
  it('collapses a run of days into a range', () => {
    expect(
      formatOpenHours({
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opensAt: '11:00',
        closesAt: '23:00',
      }),
    ).toBe('Monday - Friday: 11:00 AM - 11:00 PM');
  });

  it('lists days that are not next to each other', () => {
    expect(
      formatOpenHours({ days: ['Monday', 'Wednesday'], opensAt: '09:00', closesAt: '17:00' }),
    ).toBe('Monday, Wednesday: 09:00 AM - 05:00 PM');
  });

  it('says nothing until it has days and both times', () => {
    expect(formatOpenHours({ days: [], opensAt: '11:00', closesAt: '23:00' })).toBe('');
    expect(formatOpenHours({ days: ['Monday'], opensAt: '', closesAt: '23:00' })).toBe('');
  });

  it('reads its own output back', () => {
    const value = { days: ['Monday', 'Tuesday'], opensAt: '10:30', closesAt: '22:00' };

    expect(parseOpenHours(formatOpenHours(value))).toEqual(value);
  });

  // Places hold plenty of hand-written hours; a half-parse would overwrite them
  it('refuses a value it cannot read rather than guessing', () => {
    expect(
      parseOpenHours('Monday - Saturday: 6:00 Am - 10:00 Pm | Sunday: 9:00 Am - 10:00 Pm'),
    ).toBeNull();
    expect(parseOpenHours('Open late most nights')).toBeNull();
  });

  it('understands the casing places actually store', () => {
    expect(parseOpenHours('Monday - Sunday: 10:00 Am - 11:00 Pm')).toEqual({
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opensAt: '10:00',
      closesAt: '23:00',
    });
  });
});
