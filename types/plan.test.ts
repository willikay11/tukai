import {
  Plan,
  PlanStop,
  minutesOf,
  moveStop,
  planMeta,
  planPhoto,
  planWarnings,
  sortedByTime,
  stopEnd,
  stopWarning,
  timeLabel,
} from './plan';

const stop = (overrides: Partial<PlanStop> = {}): PlanStop => ({
  id: 's1',
  kind: 'place',
  title: 'Karura Forest',
  time: '09:00',
  durationMinutes: 90,
  ...overrides,
});

const plan = (overrides: Partial<Plan> = {}): Plan => ({
  id: 'p1',
  title: 'Saturday out',
  date: '2026-07-05',
  stops: [stop()],
  dateCreated: '2026-07-01T00:00:00Z',
  ...overrides,
});

describe('minutesOf', () => {
  it('reads a time as minutes past midnight', () => {
    expect(minutesOf('09:30')).toBe(570);
    expect(minutesOf('00:00')).toBe(0);
  });

  it.each([[''], [null], [undefined], ['9am'], ['24:00'], ['99:99']])(
    'has no answer for %s',
    (value) => {
      expect(minutesOf(value as string)).toBeNull();
    },
  );
});

describe('timeLabel', () => {
  it('reads back in twelve-hour time', () => {
    expect(timeLabel(570)).toBe('9:30 AM');
    expect(timeLabel(780)).toBe('1:00 PM');
  });

  // Midnight and noon are the two that catch a naive conversion
  it('gets midnight and noon right', () => {
    expect(timeLabel(0)).toBe('12:00 AM');
    expect(timeLabel(720)).toBe('12:00 PM');
  });

  it('says nothing without a time', () => {
    expect(timeLabel(null)).toBe('');
  });
});

describe('stopEnd', () => {
  it('is the start plus how long it takes', () => {
    expect(stopEnd(stop())).toBe(630);
  });

  it('has no end without a start', () => {
    expect(stopEnd(stop({ time: undefined }))).toBeNull();
  });

  it('assumes an hour where no duration was set', () => {
    expect(stopEnd({ id: 's', kind: 'place', title: 'x', time: '09:00' })).toBe(600);
  });
});

/**
 * Only the first thing wrong is shown: a row carrying three warnings reads as
 * broken rather than as fixable.
 */
describe('stopWarning', () => {
  it('says nothing about a stop that is fine', () => {
    expect(stopWarning(stop(), undefined, '2026-07-05')).toBeNull();
  });

  it('flags a sold-out experience', () => {
    expect(
      stopWarning(stop({ kind: 'experience', soldOut: true }), undefined, '2026-07-05'),
    ).toContain('Sold out');
  });

  // Already holding a ticket means sold out is somebody else's problem
  it('says nothing about a sold-out one already booked', () => {
    expect(
      stopWarning(
        stop({ kind: 'experience', soldOut: true, isBooked: true }),
        undefined,
        '2026-07-05',
      ),
    ).toBeNull();
  });

  it('flags an experience that runs on another day', () => {
    expect(
      stopWarning(stop({ kind: 'experience', refDate: '2026-07-12' }), undefined, '2026-07-05'),
    ).toBe('This runs on 2026-07-12, not on the day of this plan.');
  });

  it('ignores the day where the plan has none', () => {
    expect(
      stopWarning(stop({ kind: 'experience', refDate: '2026-07-12' }), undefined, null),
    ).toBeNull();
  });

  it('flags a stop that starts before the one above it', () => {
    const previous = stop({ id: 's0', time: '14:00' });

    expect(stopWarning(stop({ time: '09:00' }), previous, '2026-07-05')).toContain(
      'Starts earlier than the stop above',
    );
  });

  it('flags a stop that starts before the one above it ends', () => {
    const previous = stop({ id: 's0', title: 'Brunch', time: '09:00', durationMinutes: 120 });

    expect(stopWarning(stop({ time: '10:00' }), previous, '2026-07-05')).toBe(
      'Starts before Brunch ends at 11:00 AM.',
    );
  });

  it('says nothing about an untimed stop', () => {
    expect(stopWarning(stop({ time: undefined }), stop(), '2026-07-05')).toBeNull();
  });
});

describe('planWarnings', () => {
  it('counts the stops that need a look', () => {
    expect(
      planWarnings(
        plan({
          stops: [stop({ id: 's1', time: '14:00' }), stop({ id: 's2', time: '09:00' })],
        }),
      ),
    ).toBe(1);
  });
});

describe('planMeta', () => {
  it('counts the stops and says when the day starts', () => {
    expect(planMeta(plan())).toBe('1 stop, from 9:00 AM');
  });

  it('counts several', () => {
    expect(planMeta(plan({ stops: [stop(), stop({ id: 's2', time: '13:00' })] }))).toBe(
      '2 stops, from 9:00 AM',
    );
  });

  it('leaves the time out when nothing is timed', () => {
    expect(planMeta(plan({ stops: [stop({ time: undefined })] }))).toBe('1 stop');
  });

  it('says plainly when there is nothing on it', () => {
    expect(planMeta(plan({ stops: [] }))).toBe('No stops yet');
  });
});

describe('planPhoto', () => {
  it('is the first stop that brought one', () => {
    expect(
      planPhoto(
        plan({
          stops: [stop(), stop({ id: 's2', photo: 'karura.jpg' })],
        }),
      ),
    ).toBe('karura.jpg');
  });

  it('is nothing where no stop has a photo', () => {
    expect(planPhoto(plan())).toBeUndefined();
  });
});

describe('sortedByTime', () => {
  it('puts the day in order', () => {
    const sorted = sortedByTime([
      stop({ id: 'late', time: '15:00' }),
      stop({ id: 'early', time: '09:00' }),
    ]);

    expect(sorted.map((one) => one.id)).toEqual(['early', 'late']);
  });

  // An untimed stop has no place in the day yet, so it waits at the end
  it('leaves the untimed ones at the end', () => {
    const sorted = sortedByTime([
      stop({ id: 'none', time: undefined }),
      stop({ id: 'timed', time: '09:00' }),
    ]);

    expect(sorted.map((one) => one.id)).toEqual(['timed', 'none']);
  });

  it('leaves the original alone', () => {
    const stops = [stop({ id: 'late', time: '15:00' }), stop({ id: 'early', time: '09:00' })];
    sortedByTime(stops);

    expect(stops[0].id).toBe('late');
  });
});

describe('moveStop', () => {
  const stops = [stop({ id: 'a' }), stop({ id: 'b' }), stop({ id: 'c' })];

  it('moves one up', () => {
    expect(moveStop(stops, 1, 0).map((one) => one.id)).toEqual(['b', 'a', 'c']);
  });

  it('moves one down', () => {
    expect(moveStop(stops, 0, 2).map((one) => one.id)).toEqual(['b', 'c', 'a']);
  });

  it.each([
    [0, 0],
    [-1, 0],
    [0, 5],
  ])('leaves the order alone for a move from %i to %i', (from, to) => {
    expect(moveStop(stops, from, to)).toBe(stops);
  });
});
