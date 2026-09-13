import { doTimesOverlap, findOverlappingActivity, isEndAfterStart } from '@/utils/itinerary-utils';

describe('doTimesOverlap', () => {
  it('returns false when ranges are entirely separate', () => {
    expect(
      doTimesOverlap(
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '11:00', endTime: '12:00' },
      ),
    ).toBe(false);
  });

  it('returns false when ranges touch but do not overlap', () => {
    expect(
      doTimesOverlap(
        { startTime: '10:00', endTime: '12:00' },
        { startTime: '12:00', endTime: '14:00' },
      ),
    ).toBe(false);
  });

  it('returns true when ranges partially overlap', () => {
    expect(
      doTimesOverlap(
        { startTime: '10:00', endTime: '12:00' },
        { startTime: '11:00', endTime: '13:00' },
      ),
    ).toBe(true);
  });

  it('returns true when one range contains the other', () => {
    expect(
      doTimesOverlap(
        { startTime: '10:00', endTime: '12:00' },
        { startTime: '09:00', endTime: '13:00' },
      ),
    ).toBe(true);
  });

  it('returns true for identical ranges', () => {
    expect(
      doTimesOverlap(
        { startTime: '10:00', endTime: '12:00' },
        { startTime: '10:00', endTime: '12:00' },
      ),
    ).toBe(true);
  });

  it('returns false when either range is incomplete', () => {
    expect(
      doTimesOverlap(
        { startTime: null, endTime: '12:00' },
        { startTime: '10:00', endTime: '13:00' },
      ),
    ).toBe(false);
    expect(
      doTimesOverlap(
        { startTime: '10:00', endTime: null },
        { startTime: '10:00', endTime: '13:00' },
      ),
    ).toBe(false);
  });
});

describe('findOverlappingActivity', () => {
  const activities = [
    { id: 'a', startTime: '09:00', endTime: '11:00', title: 'Breakfast' },
    { id: 'b', startTime: '14:00', endTime: '16:00', title: 'Museum' },
    { id: 'c', startTime: '18:00', endTime: '20:00', title: 'Dinner' },
  ];

  it('returns null when no overlap exists', () => {
    const target = {
      id: 'new',
      startTime: '12:00',
      endTime: '13:00',
    };
    expect(findOverlappingActivity(target, activities)).toBeNull();
  });

  it('returns the overlapping activity', () => {
    const target = {
      id: 'new',
      startTime: '10:00',
      endTime: '12:00',
    };
    const result = findOverlappingActivity(target, activities);
    expect(result?.id).toBe('a');
  });

  it('excludes the target itself by id', () => {
    const target = { id: 'a', startTime: '09:00', endTime: '11:00' };
    const result = findOverlappingActivity(target, activities);
    expect(result).toBeNull();
  });

  it('returns null when target has incomplete times', () => {
    const target = { id: 'new', startTime: null, endTime: '11:00' };
    expect(findOverlappingActivity(target, activities)).toBeNull();
  });
});

describe('isEndAfterStart', () => {
  it('returns true when end is after start', () => {
    expect(isEndAfterStart('09:00', '10:00')).toBe(true);
  });

  it('returns false when end is before start', () => {
    expect(isEndAfterStart('10:00', '09:00')).toBe(false);
  });

  it('returns false when end equals start', () => {
    expect(isEndAfterStart('10:00', '10:00')).toBe(false);
  });

  it('returns true when either is null', () => {
    expect(isEndAfterStart(null, '10:00')).toBe(true);
    expect(isEndAfterStart('10:00', null)).toBe(true);
  });
});
