import type { TukaiItem, TukaiMessage } from '@/types/tukai';

import {
  buildTukaiHistory,
  chatTitleFrom,
  cleanTukaiText,
  idsInReply,
  parseTukaiReply,
  stopEnd,
  stopRange,
  toTwelveHour,
  tukaiPins,
} from './tukai';

const item = (id: string, overrides: Partial<TukaiItem> = {}): TukaiItem => ({
  id,
  kind: 'place',
  title: `Item ${id}`,
  sub: 'Cafe · Westlands',
  category: 'Cafe',
  area: 'Westlands',
  photos: [],
  about: '',
  detail: '',
  lat: -1.26,
  lng: 36.81,
  ...overrides,
});

const catalogue: Record<string, TukaiItem> = {
  p1: item('p1'),
  p2: item('p2'),
  e1: item('e1', { kind: 'experience' }),
  c1: item('c1', { kind: 'community' }),
};

describe('cleanTukaiText', () => {
  it('turns long dashes into hyphens between numbers and commas elsewhere, and drops bold', () => {
    expect(cleanTukaiText('Open 9–17 — **lovely**')).toBe('Open 9 - 17, lovely');
  });
});

describe('times', () => {
  it('formats twelve-hour times', () => {
    expect(toTwelveHour('00:15')).toBe('12:15 AM');
    expect(toTwelveHour('19:30')).toBe('7:30 PM');
  });

  it('ends a stop 90 minutes on, or 15 minutes before the next one', () => {
    const stops = [
      { id: 'a', time: '10:00', end: '', note: '' },
      { id: 'b', time: '11:00', end: '', note: '' },
      { id: 'c', time: '14:00', end: '', note: '' },
    ];
    expect(stopEnd(stops, 0)).toBe('10:45');
    expect(stopEnd(stops, 1)).toBe('12:30');
    expect(stopEnd(stops, 2)).toBe('15:30');
  });

  it('shares the AM or PM within a range, and says Any time without one', () => {
    const stops = [
      { id: 'a', time: '10:00', end: '11:45', note: '' },
      { id: 'b', time: '11:00', end: '13:30', note: '' },
      { id: 'c', time: '', end: '', note: '' },
    ];
    expect(stopRange(stops, 0)).toBe('10:00 - 11:45 AM');
    expect(stopRange(stops, 1)).toBe('11:00 AM - 1:30 PM');
    expect(stopRange(stops, 2)).toBe('Any time');
  });
});

describe('chatTitleFrom', () => {
  it('cuts titles longer than 60 characters to 57 and "..."', () => {
    expect(chatTitleFrom('a'.repeat(60))).toBe('a'.repeat(60));
    expect(chatTitleFrom('a'.repeat(61))).toBe(`${'a'.repeat(57)}...`);
  });
});

describe('parseTukaiReply', () => {
  it('drops ids not in the catalogue and duplicates', () => {
    const reply = parseTukaiReply(
      JSON.stringify({
        reply: 'Here',
        cards: ['p1', 'nope', 'p1', { id: 'p2' }],
        suggestions: ['More'],
      }),
      catalogue,
      [],
    );
    expect(reply.cards).toEqual(['p1', 'p2']);
    expect(reply.suggestions).toEqual(['More']);
  });

  it('reads JSON wrapped in prose or code fences', () => {
    const reply = parseTukaiReply('```json\n{"reply": "Hi", "cards": []}\n```', catalogue, []);
    expect(reply.text).toBe('Hi');
  });

  it('shows a reply that is not JSON as plain text', () => {
    expect(parseTukaiReply('Just words', catalogue, [])).toMatchObject({
      text: 'Just words',
      cards: [],
    });
  });

  it('marks an empty reply as an error', () => {
    expect(parseTukaiReply('', catalogue, [])).toMatchObject({ error: true });
  });

  it('cleans times and caps plans at 7 days and 5 stops a day', () => {
    const days = Array.from({ length: 9 }, () => ({
      title: 'Day',
      stops: Array.from({ length: 7 }, () => ({ id: 'p1', time: '9:30', end: 'later', note: 'x' })),
    }));
    const reply = parseTukaiReply(
      JSON.stringify({ reply: '', plan: { title: 'Trip', days } }),
      catalogue,
      [],
    );
    expect(reply.plan?.days).toHaveLength(7);
    expect(reply.plan?.days[0].stops).toHaveLength(5);
    expect(reply.plan?.days[0].stops[0]).toMatchObject({ time: '09:30', end: '' });
  });

  it('drops a plan whose stops are all unknown', () => {
    const reply = parseTukaiReply(
      JSON.stringify({ plan: { title: 'Trip', days: [{ stops: [{ id: 'nope' }] }] } }),
      catalogue,
      [],
    );
    expect(reply.plan).toBeNull();
  });

  it('keeps a draft only for someone who owns a community, and only for one they own', () => {
    const json = JSON.stringify({
      draft: {
        title: 'Sunrise hike',
        type: 'weird',
        placeId: 'e1',
        commId: 'theirs',
        price: -5,
        date: 'soon',
      },
    });
    expect(parseTukaiReply(json, catalogue, []).draft).toBeNull();
    expect(parseTukaiReply(json, catalogue, ['mine']).draft).toMatchObject({
      type: 'one',
      placeId: null,
      commId: 'mine',
      price: 0,
      date: '',
    });
  });

  it('keeps up to 3 writing options', () => {
    const reply = parseTukaiReply(
      JSON.stringify({
        writing: { label: 'Caption options', kind: 'caption', options: ['a', 'b', 'c', 'd'] },
      }),
      catalogue,
      [],
    );
    expect(reply.writing?.options).toEqual(['a', 'b', 'c']);
  });

  it('lists every id a reply points at', () => {
    const reply = parseTukaiReply(
      JSON.stringify({
        cards: ['c1'],
        plan: { title: 'T', days: [{ stops: [{ id: 'p1' }, { id: 'e1' }] }] },
      }),
      catalogue,
      [],
    );
    expect(idsInReply(reply).sort()).toEqual(['c1', 'e1', 'p1']);
  });
});

describe('buildTukaiHistory', () => {
  it('skips failed replies, merges neighbours and starts with the person', () => {
    const messages: TukaiMessage[] = [
      { id: '0', role: 'ai', text: 'stray', createdAt: '' },
      { id: '1', role: 'user', text: 'Hi', createdAt: '' },
      { id: '2', role: 'ai', text: 'Oops', error: true, createdAt: '' },
      { id: '3', role: 'user', text: 'Again', createdAt: '' },
      { id: '4', role: 'ai', text: 'Here', cards: ['p1'], createdAt: '' },
    ];
    const turns = buildTukaiHistory(messages);
    expect(turns.map((t) => t.role)).toEqual(['user', 'assistant']);
    expect(turns[0].content).toBe('Hi\nAgain');
    expect(JSON.parse(turns[1].content)).toMatchObject({ reply: 'Here', cards: ['p1'] });
  });
});

describe('tukaiPins', () => {
  it('numbers plan stops in order, with their day and time, and skips items without coordinates', () => {
    const message: TukaiMessage = {
      id: 'm',
      role: 'ai',
      text: '',
      createdAt: '',
      items: { ...catalogue, p2: item('p2', { lat: null, lng: null }) },
      plan: {
        title: 'T',
        tip: '',
        days: [
          {
            title: '',
            stops: [
              { id: 'p2', time: '', end: '', note: '' },
              { id: 'p1', time: '10:00', end: '11:00', note: '' },
            ],
          },
          { title: '', stops: [{ id: 'e1', time: '', end: '', note: '' }] },
        ],
      },
    };
    const { numbers, pins } = tukaiPins(message);
    expect(numbers).toEqual({ p1: 1, e1: 2 });
    expect(pins[0]).toMatchObject({ id: 'p1', day: 1, when: 'Day 1 · 10:00 AM - 11:00 AM' });
    expect(pins[1]).toMatchObject({ id: 'e1', day: 2, when: 'Day 2' });
  });
});
