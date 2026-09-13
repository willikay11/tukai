import {
  SlotTemplateRecord,
  buildSlotTemplatePayload,
  calculateDurationMinutes,
  calculateEndTime,
  diffSlotTemplates,
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

describe('diffSlotTemplates', () => {
  const makeRecord = (id: string, startTime: string, endTime: string): SlotTemplateRecord => ({
    uiId: id,
    templateId: id,
    startTime,
    endTime,
  });

  it('returns empty arrays when slots are unchanged', () => {
    const current = [
      { startTime: '09:00', endTime: '11:00' },
      { startTime: '14:00', endTime: '16:00' },
    ];
    const existing = [makeRecord('t1', '09:00', '11:00'), makeRecord('t2', '14:00', '16:00')];
    const result = diffSlotTemplates(current, existing);
    expect(result.toCreate).toHaveLength(0);
    expect(result.toUpdate).toHaveLength(0);
    expect(result.toDelete).toHaveLength(0);
  });

  it('detects a new slot to create', () => {
    const current = [
      { startTime: '09:00', endTime: '11:00' },
      { startTime: '14:00', endTime: '16:00' },
    ];
    const existing = [makeRecord('t1', '09:00', '11:00')];
    const result = diffSlotTemplates(current, existing);
    expect(result.toCreate).toHaveLength(1);
    expect(result.toCreate[0]).toEqual({
      startTime: '14:00',
      endTime: '16:00',
    });
    expect(result.toUpdate).toHaveLength(0);
    expect(result.toDelete).toHaveLength(0);
  });

  it('detects a deleted slot', () => {
    const current = [{ startTime: '09:00', endTime: '11:00' }];
    const existing = [makeRecord('t1', '09:00', '11:00'), makeRecord('t2', '14:00', '16:00')];
    const result = diffSlotTemplates(current, existing);
    expect(result.toCreate).toHaveLength(0);
    expect(result.toUpdate).toHaveLength(0);
    expect(result.toDelete).toHaveLength(1);
    expect(result.toDelete[0].templateId).toBe('t2');
  });

  it('detects an updated slot start time', () => {
    const current = [{ startTime: '10:00', endTime: '11:00' }];
    const existing = [makeRecord('t1', '09:00', '11:00')];
    const result = diffSlotTemplates(current, existing);
    expect(result.toUpdate).toHaveLength(1);
    expect(result.toUpdate[0].startTime).toBe('10:00');
    expect(result.toUpdate[0].record.templateId).toBe('t1');
    expect(result.toCreate).toHaveLength(0);
    expect(result.toDelete).toHaveLength(0);
  });

  it('detects an updated slot end time', () => {
    const current = [{ startTime: '09:00', endTime: '12:00' }];
    const existing = [makeRecord('t1', '09:00', '11:00')];
    const result = diffSlotTemplates(current, existing);
    expect(result.toUpdate).toHaveLength(1);
    expect(result.toUpdate[0].endTime).toBe('12:00');
  });

  it('handles all three operations at once', () => {
    const current = [
      { startTime: '09:00', endTime: '11:00' }, // unchanged (index 0)
      { startTime: '13:00', endTime: '15:00' }, // updated (index 1, was 14:00)
      { startTime: '18:00', endTime: '20:00' }, // updated (index 2, was 16:00)
    ];
    const existing = [
      makeRecord('t1', '09:00', '11:00'),
      makeRecord('t2', '14:00', '15:00'),
      makeRecord('t3', '16:00', '17:00'),
      makeRecord('t4', '21:00', '22:00'), // deleted (index 3 >= current.length(3))
    ];
    const result = diffSlotTemplates(current, existing);
    expect(result.toCreate).toHaveLength(0); // all indices 0-2 have existing
    expect(result.toUpdate).toHaveLength(2); // indices 1 and 2 changed
    expect(result.toDelete).toHaveLength(1); // index 3 is beyond length
  });

  it('handles no existing records (first time creation)', () => {
    const current = [
      { startTime: '09:00', endTime: '11:00' },
      { startTime: '14:00', endTime: '16:00' },
    ];
    const result = diffSlotTemplates(current, []);
    expect(result.toCreate).toHaveLength(2);
    expect(result.toUpdate).toHaveLength(0);
    expect(result.toDelete).toHaveLength(0);
  });

  it('handles all slots deleted', () => {
    const existing = [makeRecord('t1', '09:00', '11:00'), makeRecord('t2', '14:00', '16:00')];
    const result = diffSlotTemplates([], existing);
    expect(result.toCreate).toHaveLength(0);
    expect(result.toUpdate).toHaveLength(0);
    expect(result.toDelete).toHaveLength(2);
  });
});
