import { PlaceBookingRequest } from '@/types/placeReservation';

import {
  awaitingAnswerCount,
  daysAwaitingAnswer,
  hostReservations,
  inGroup,
  isAdmittable,
  isAwaitingAnswer,
  liveCountsByDay,
  matchesGuest,
  paymentLine,
  reservationsOnDay,
  summaryCounts,
  summaryTabOf,
} from './host-reservations';

const request = (
  id: string,
  status: PlaceBookingRequest['status'],
  startDate: string | undefined,
  extra: Partial<PlaceBookingRequest> = {},
): PlaceBookingRequest => ({
  id,
  status,
  occurrence: startDate ? { id: `o-${id}`, startDate } : undefined,
  ...extra,
});

const NOV_3 = '2026-11-03T18:00:00';
const NOV_4 = '2026-11-04T12:30:00';

const first = (requests: PlaceBookingRequest[]) => hostReservations(requests)[0];

describe('hostReservations', () => {
  it('files a request under the day it starts and the list its status belongs on', () => {
    const reservations = hostReservations([
      request('a', 'requested', NOV_3),
      request('b', 'completed', NOV_3),
      request('c', 'redeemed', NOV_3),
      request('d', 'declined', NOV_3),
    ]);

    expect(reservations.map((r) => [r.id, r.group, r.dayKey])).toEqual([
      ['a', 'reservations', '2026-11-03'],
      ['b', 'reservations', '2026-11-03'],
      ['c', 'admitted', '2026-11-03'],
      ['d', 'no-show', '2026-11-03'],
    ]);
  });

  it.each(['requested', 'accepted', 'pending', 'completed'] as const)(
    'lists a %s request under reservations',
    (status) => {
      expect(first([request('a', status, NOV_3)]).group).toBe('reservations');
    },
  );

  it.each(['declined', 'cancelled', 'expired'] as const)(
    'lists a %s request under no show',
    (status) => {
      expect(first([request('a', status, NOV_3)]).group).toBe('no-show');
    },
  );

  it('leaves out a failed or refunded request, which the host cannot act on', () => {
    expect(
      hostReservations([request('a', 'failed', NOV_3), request('b', 'refunded', NOV_3)]),
    ).toEqual([]);
  });

  it('leaves out a request with no readable start rather than guess a day', () => {
    expect(
      hostReservations([request('a', 'requested', undefined), request('b', 'requested', 'soon')]),
    ).toEqual([]);
  });

  it('sorts soonest first', () => {
    const ids = hostReservations([
      request('late', 'requested', NOV_4),
      request('soon', 'requested', NOV_3),
    ]).map((r) => r.id);

    expect(ids).toEqual(['soon', 'late']);
  });

  it('names the guest from the names the API sent, or says Someone', () => {
    expect(
      first([
        request('a', 'requested', NOV_3, {
          user: { id: 'u1', firstName: 'Amina', lastName: 'Hassan' },
        }),
      ]).guestName,
    ).toBe('Amina Hassan');
    expect(first([request('a', 'requested', NOV_3)]).guestName).toBe('Someone');
  });

  it('reads the party size, defaulting to one guest', () => {
    expect(
      first([request('a', 'requested', NOV_3, { restaurantDetail: { partySize: 6 } })]).partySize,
    ).toBe(6);
    expect(first([request('a', 'requested', NOV_3)]).partySize).toBe(1);
  });

  it('shows the special request, falling back to the message', () => {
    const both = first([
      request('a', 'requested', NOV_3, {
        restaurantDetail: { partySize: 2, specialRequests: 'Window seat' },
        message: 'Date Night',
      }),
    ]);
    const messageOnly = first([request('a', 'requested', NOV_3, { message: 'Date Night' })]);

    expect(both.note).toBe('Window seat');
    expect(messageOnly.note).toBe('Date Night');
    expect(first([request('a', 'requested', NOV_3)]).note).toBe('');
  });
});

describe('what the host can do with a reservation', () => {
  const of = (status: PlaceBookingRequest['status']) => first([request('a', status, NOV_3)]);

  it('answers only a request that is still asking', () => {
    expect(isAwaitingAnswer(of('requested'))).toBe(true);
    expect(isAwaitingAnswer(of('accepted'))).toBe(false);
  });

  it('admits only a settled reservation', () => {
    expect(isAdmittable(of('completed'))).toBe(true);
    expect(isAdmittable(of('requested'))).toBe(false);
    expect(isAdmittable(of('accepted'))).toBe(false);
    expect(isAdmittable(of('pending'))).toBe(false);
  });

  it('says what an unsettled booking is waiting on', () => {
    expect(paymentLine(of('accepted'))).toBe('Payment due');
    expect(paymentLine(of('pending'))).toBe('Payment pending');
    expect(paymentLine(of('completed'))).toBeNull();
  });
});

describe('days and lists', () => {
  const reservations = hostReservations([
    request('a', 'requested', NOV_3),
    request('b', 'completed', NOV_3),
    request('c', 'redeemed', NOV_3),
    request('d', 'accepted', NOV_4),
  ]);

  it('picks out the reservations on one day', () => {
    expect(reservationsOnDay(reservations, '2026-11-04').map((r) => r.id)).toEqual(['d']);
  });

  it('picks out one list', () => {
    expect(inGroup(reservations, 'admitted').map((r) => r.id)).toEqual(['c']);
  });

  it('counts only live reservations towards a day', () => {
    expect(liveCountsByDay(reservations)).toEqual(
      new Map([
        ['2026-11-03', 2],
        ['2026-11-04', 1],
      ]),
    );
  });

  it('marks the days that have a request waiting', () => {
    expect(daysAwaitingAnswer(reservations)).toEqual(new Set(['2026-11-03']));
  });

  it('counts the requests waiting across every day', () => {
    expect(awaitingAnswerCount(reservations)).toBe(1);
  });
});

describe('matchesGuest', () => {
  const amina = first([
    request('a', 'requested', NOV_3, {
      user: { id: 'u1', firstName: 'Amina', lastName: 'Hassan' },
    }),
  ]);

  it('matches any part of the name, ignoring case', () => {
    expect(matchesGuest(amina, 'hass')).toBe(true);
    expect(matchesGuest(amina, '  AMINA ')).toBe(true);
  });

  it('matches everyone on an empty search', () => {
    expect(matchesGuest(amina, '')).toBe(true);
    expect(matchesGuest(amina, '   ')).toBe(true);
  });

  it('does not match a different name', () => {
    expect(matchesGuest(amina, 'kamau')).toBe(false);
  });
});

describe('summaryTabOf', () => {
  it('separates a request waiting for an answer from a booking already open', () => {
    expect(summaryTabOf(first([request('a', 'requested', NOV_3)]))).toBe('request');
    expect(summaryTabOf(first([request('a', 'accepted', NOV_3)]))).toBe('confirmed');
    expect(summaryTabOf(first([request('a', 'completed', NOV_3)]))).toBe('confirmed');
  });

  it('keeps admitted and missed bookings under their own names', () => {
    expect(summaryTabOf(first([request('a', 'redeemed', NOV_3)]))).toBe('admitted');
    expect(summaryTabOf(first([request('a', 'declined', NOV_3)]))).toBe('no-show');
  });
});

describe('summaryCounts', () => {
  it('counts each tab', () => {
    const counts = summaryCounts(
      hostReservations([
        request('a', 'requested', NOV_3),
        request('b', 'requested', NOV_3),
        request('c', 'completed', NOV_3),
        request('d', 'redeemed', NOV_3),
        request('e', 'expired', NOV_3),
      ]),
    );

    expect(counts).toEqual({ request: 2, confirmed: 1, admitted: 1, 'no-show': 1 });
  });

  it('is zero all round for an empty day', () => {
    expect(summaryCounts([])).toEqual({ request: 0, confirmed: 0, admitted: 0, 'no-show': 0 });
  });
});
