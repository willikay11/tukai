import {
  buildSlotTemplatePayload,
  calculateDurationMinutes,
  calculateEndTime,
} from '@/utils/slot-template-utils';

describe('calculateDurationMinutes', () => {
  it('calculates 30 minute slot', () => {
    expect(calculateDurationMinutes('09:00', '09:30')).toBe(30);
  });

  it('calculates 2 hour slot', () => {
    expect(calculateDurationMinutes('09:00', '11:00')).toBe(120);
  });

  it('calculates slot crossing the hour', () => {
    expect(calculateDurationMinutes('09:30', '10:15')).toBe(45);
  });

  it('calculates full work day', () => {
    expect(calculateDurationMinutes('08:00', '17:00')).toBe(540);
  });

  it('handles overnight slot', () => {
    expect(calculateDurationMinutes('22:00', '02:00')).toBe(240);
  });

  it('returns 0 for same start and end', () => {
    expect(calculateDurationMinutes('10:00', '10:00')).toBe(0);
  });
});

describe('calculateEndTime', () => {
  it('calculates end for 30 minute slot', () => {
    expect(calculateEndTime('09:00', 30)).toBe('09:30');
  });

  it('calculates end for 2 hour slot', () => {
    expect(calculateEndTime('09:00', 120)).toBe('11:00');
  });

  it('handles crossing midnight', () => {
    expect(calculateEndTime('22:00', 240)).toBe('02:00');
  });

  it('pads single digit minutes', () => {
    expect(calculateEndTime('09:00', 5)).toBe('09:05');
  });

  it('pads single digit hours', () => {
    expect(calculateEndTime('00:00', 60)).toBe('01:00');
  });

  it('is inverse of calculateDurationMinutes', () => {
    const start = '09:30';
    const end = '11:15';
    const duration = calculateDurationMinutes(start, end);
    expect(calculateEndTime(start, duration)).toBe(end);
  });
});

describe('buildSlotTemplatePayload', () => {
  it('builds correct payload for basic slot', () => {
    expect(
      buildSlotTemplatePayload({
        startTime: '09:00',
        endTime: '11:00',
      }),
    ).toEqual({
      start_time: '09:00',
      duration_minutes: 120,
      name: undefined,
      recurrence_rule: null,
    });
  });

  it('includes name when provided', () => {
    const result = buildSlotTemplatePayload({
      startTime: '09:00',
      endTime: '11:00',
      name: 'Morning Session',
    });
    expect(result.name).toBe('Morning Session');
  });

  it('includes recurrence_rule when provided', () => {
    const rrule = 'FREQ=WEEKLY;BYDAY=MO,WE';
    const result = buildSlotTemplatePayload({ startTime: '09:00', endTime: '11:00' }, rrule);
    expect(result.recurrence_rule).toBe(rrule);
  });

  it('sets recurrence_rule to null when not provided', () => {
    const result = buildSlotTemplatePayload({
      startTime: '09:00',
      endTime: '11:00',
    });
    expect(result.recurrence_rule).toBeNull();
  });

  it('calculates correct duration for 45 min slot', () => {
    const result = buildSlotTemplatePayload({
      startTime: '10:00',
      endTime: '10:45',
    });
    expect(result.duration_minutes).toBe(45);
  });
});
