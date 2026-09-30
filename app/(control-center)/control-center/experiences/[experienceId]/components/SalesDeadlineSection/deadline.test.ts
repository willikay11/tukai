import moment from 'moment';

import { Experience } from '@/types/experience';

import { deadlineAt, deadlineLabel, deadlineWhen, presetFor } from './deadline';

const experience = (overrides: Partial<Experience> = {}): Experience =>
  ({
    id: 'e1',
    title: 'Sunrise hike',
    description: 'Up early',
    startDate: '2026-07-05T07:00:00Z',
    endDate: '2026-07-05T12:00:00Z',
    ticketSalesClosingDuration: 1,
    ticketSalesClosingUnit: 'days',
    ticketSalesClosingCondition: 'before_start',
    ...overrides,
  }) as unknown as Experience;

describe('deadlineLabel', () => {
  // The API's units are plural; one of anything is not
  it('says one hour in the singular', () => {
    expect(deadlineLabel(1, 'hours', 'before_start')).toBe('1 hour before the experience starts');
  });

  it('keeps the plural for more than one', () => {
    expect(deadlineLabel(2, 'days', 'before_end')).toBe('2 days before the experience ends');
  });

  it('reads the end condition off the end', () => {
    expect(deadlineLabel(1, 'hours', 'before_end')).toBe('1 hour before the experience ends');
  });

  it('says nothing is set when nothing is', () => {
    expect(deadlineLabel(null, null, null)).toBe('Not set');
    expect(deadlineLabel(0, 'hours', 'before_start')).toBe('Not set');
  });
});

describe('presetFor', () => {
  it('recognises each of the three the canvas offers', () => {
    expect(presetFor(1, 'hours', 'before_start')?.key).toBe('1h-start');
    expect(presetFor(1, 'hours', 'before_end')?.key).toBe('1h-end');
    expect(presetFor(1, 'days', 'before_start')?.key).toBe('1d-start');
  });

  // Older experiences leave the condition unset, and the default is the start
  it('treats a missing condition as before the start', () => {
    expect(presetFor(1, 'days', null)?.key).toBe('1d-start');
  });

  it('recognises nothing when the value is not one of them', () => {
    expect(presetFor(3, 'days', 'before_start')).toBeUndefined();
  });
});

describe('deadlineAt', () => {
  it('counts back from the start', () => {
    expect(deadlineAt(experience())?.toISOString()).toBe('2026-07-04T07:00:00.000Z');
  });

  it('counts back from the end when the condition says so', () => {
    const at = deadlineAt(
      experience({
        ticketSalesClosingDuration: 1,
        ticketSalesClosingUnit: 'hours',
        ticketSalesClosingCondition: 'before_end',
      }),
    );

    expect(at?.toISOString()).toBe('2026-07-05T11:00:00.000Z');
  });

  // The preview before saving: what the chosen option would come to
  it('counts back from an override instead', () => {
    const at = deadlineAt(experience(), {
      key: '1h-start',
      duration: 1,
      unit: 'hours',
      condition: 'before_start',
    });

    expect(at?.toISOString()).toBe('2026-07-05T06:00:00.000Z');
  });

  it('has no answer when no deadline is set', () => {
    expect(deadlineAt(experience({ ticketSalesClosingDuration: undefined }))).toBeNull();
  });

  it('has no answer when the experience has no dates', () => {
    expect(deadlineAt(experience({ startDate: '' }))).toBeNull();
  });
});

describe('deadlineWhen', () => {
  // Formatted in the reader's own zone, so the expectation is too
  it('reads the date back so a host does not have to work it out', () => {
    const at = new Date('2026-07-04T14:00:00Z');

    expect(deadlineWhen(at)).toBe(`Sales close ${moment(at).format('ddd D MMM, h:mm A')}.`);
  });

  // A recurring experience closes sales per date, not once
  it('says which date it means for a recurring one', () => {
    expect(deadlineWhen(new Date('2026-07-04T14:00:00Z'), true)).toContain('for the next date.');
  });

  it('says plainly when there is no deadline', () => {
    expect(deadlineWhen(null)).toBe(
      'No deadline is set, so sales run until the experience starts.',
    );
  });
});
