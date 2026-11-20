import { PlaceBoost, boostDay, boostStateOf } from './placeBoost';

const NOW = new Date('2026-11-20T12:00:00Z');

const boost = (extra: Partial<PlaceBoost> = {}): PlaceBoost => ({
  id: 'b1',
  package: null,
  price: { amount: '1000.00', currency: 'KES' },
  durationDays: 7,
  status: 'paid',
  startsAt: '2026-11-18T12:00:00Z',
  endsAt: '2026-11-25T12:00:00Z',
  isLive: true,
  orderId: null,
  dateCreated: '2026-11-18T11:00:00Z',
  ...extra,
});

// DEV-392: whether a place is boosted, and until when
describe('boostStateOf', () => {
  it('finds the boost running now and when it ends', () => {
    expect(boostStateOf([boost()], NOW)).toMatchObject({
      live: { id: 'b1' },
      boostedUntil: '2026-11-25T12:00:00Z',
      queued: [],
    });
  });

  it('runs on to the end of a boost queued after the live one', () => {
    const next = boost({
      id: 'b2',
      isLive: false,
      startsAt: '2026-11-25T12:00:00Z',
      endsAt: '2026-12-02T12:00:00Z',
    });

    const state = boostStateOf([next, boost()], NOW);

    expect(state.live?.id).toBe('b1');
    expect(state.queued.map((one) => one.id)).toEqual(['b2']);
    expect(state.boostedUntil).toBe('2026-12-02T12:00:00Z');
  });

  it('is not boosted by one that ended, or one not paid for', () => {
    expect(
      boostStateOf(
        [
          boost({ endsAt: '2026-11-19T12:00:00Z', isLive: false }),
          boost({ id: 'b2', status: 'pending', isLive: false }),
          boost({ id: 'b3', status: 'failed', isLive: false }),
        ],
        NOW,
      ),
    ).toEqual({ live: null, boostedUntil: null, queued: [] });
  });

  it('names a day the short way', () => {
    expect(boostDay('2026-11-28T12:00:00')).toBe('Sat 28 Nov');
  });
});
