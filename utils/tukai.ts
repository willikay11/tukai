import type {
  TukaiDraft,
  TukaiHistoryTurn,
  TukaiItem,
  TukaiMessage,
  TukaiPlan,
  TukaiPlanStop,
  TukaiReply,
  TukaiWriting,
} from '@/types/tukai';

/** A free account's allowance: chats, and the person's own messages in each. */
export const TUKAI_FREE_CHATS = 2;
export const TUKAI_FREE_MESSAGES = 10;
export const TUKAI_PRICE_LABEL = '$14.99';

/** Plans are cut to this after parsing, whatever the model sent. */
const MAX_PLAN_DAYS = 7;
const MAX_STOPS_A_DAY = 5;
const MAX_CARDS = 6;

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * House style for anything the model wrote: long dashes become a hyphen
 * between numbers and a comma elsewhere, and markdown bold goes.
 */
export const cleanTukaiText = (value: unknown): string =>
  String(value == null ? '' : value)
    .replace(/(\d)\s*[–—]\s*(\d)/g, '$1 - $2')
    .replace(/\s*[–—]\s*/g, ', ')
    .replace(/\*\*/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();

/** "HH:MM" from anything that looks like a time, or empty. */
export const cleanTime = (value: unknown): string =>
  /^\d{1,2}:\d{2}$/.test(String(value || '')) ? String(value).padStart(5, '0') : '';

const toMinutes = (value: string): number | null => {
  const m = /^(\d{1,2}):(\d{2})/.exec(value);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

const fromMinutes = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** "19:30" → "7:30 PM". */
export const toTwelveHour = (value: string): string => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(value || ''));
  if (!m) return '';
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`;
};

/**
 * When a stop ends. Without an end time it lasts 90 minutes, or until 15
 * minutes before the next stop when that comes sooner.
 */
export const stopEnd = (stops: TukaiPlanStop[], index: number): string => {
  const stop = stops[index];
  if (!stop?.time) return '';
  if (stop.end) return stop.end;
  const start = toMinutes(stop.time);
  if (start == null) return '';
  const next = stops[index + 1]?.time ? toMinutes(stops[index + 1].time) : null;
  let end = start + 90;
  if (next != null && next - 15 >= start + 30 && next - 15 < end) end = next - 15;
  return fromMinutes(Math.min(end, 23 * 60 + 59));
};

/**
 * "10:00 - 11:45 AM", or "10:00 AM - 1:30 PM" across noon. A stop with no
 * time is "Any time".
 */
export const stopRange = (stops: TukaiPlanStop[], index: number): string => {
  const stop = stops[index];
  if (!stop?.time) return 'Any time';
  const split = (v: string) => /^(\d{1,2}:\d{2})\s*(AM|PM)$/i.exec(toTwelveHour(v));
  const a = split(stop.time);
  const end = stopEnd(stops, index);
  const b = end ? split(end) : null;
  if (!a) return 'Any time';
  if (!b) return `${a[1]} ${a[2]}`;
  return `${a[2] === b[2] ? a[1] : `${a[1]} ${a[2]}`} - ${b[1]} ${b[2]}`;
};

/** "2026-11-07" → "Sat 7 Nov". */
export const shortDay = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return '';
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return `${DAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};

/** A chat's title: its first message, cut to 57 characters and "..." past 60. */
export const chatTitleFrom = (text: string): string =>
  text.length > 60 ? `${text.slice(0, 57)}...` : text;

export const countUserMessages = (messages: TukaiMessage[]): number =>
  messages.filter((m) => m.role === 'user').length;

export const planStopCount = (plan: TukaiPlan): number =>
  plan.days.reduce((total, day) => total + day.stops.length, 0);

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * The last 14 messages as model turns. TukAI's own replies go back as the
 * JSON they came from, minus the items, so the model sees what it already
 * suggested. Failed replies are left out, and same-role neighbours merge.
 */
export const buildTukaiHistory = (messages: TukaiMessage[]): TukaiHistoryTurn[] => {
  const turns: TukaiHistoryTurn[] = [];
  messages.slice(-14).forEach((m) => {
    if (m.error) return;
    const role = m.role === 'user' ? 'user' : 'assistant';
    const content =
      m.role === 'user'
        ? m.text
        : JSON.stringify({
            reply: m.text || '',
            cards: m.cards ?? [],
            plan: m.plan ? m.plan.title : null,
            draft: m.draft ? m.draft.title : null,
            writing: m.writing ? m.writing.options : null,
          });
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.content += `\n${content}`;
    else turns.push({ role, content });
  });
  while (turns.length && turns[0].role !== 'user') turns.shift();
  return turns;
};

/**
 * The checks every reply goes through before it reaches the person: ids not
 * in the catalogue are dropped and duplicates removed, times are cleaned,
 * plans are capped, a draft's community must be one the person owns, and a
 * reply that is not JSON is shown as plain text.
 */
export const parseTukaiReply = (
  raw: string,
  catalogue: Record<string, TukaiItem>,
  ownedCommunityIds: string[],
): Omit<TukaiReply, 'items'> => {
  const s = String(raw || '');
  const a = s.indexOf('{');
  const b = s.lastIndexOf('}');
  const known = (id: unknown): id is string => typeof id === 'string' && Boolean(catalogue[id]);

  let json: any = null;
  if (a >= 0 && b > a) {
    try {
      json = JSON.parse(s.slice(a, b + 1));
    } catch {
      json = null;
    }
  }

  const empty = { cards: [], plan: null, draft: null, writing: null, suggestions: [] };

  if (!json || typeof json !== 'object') {
    const text = cleanTukaiText(s.replace(/`{3}[a-z]*/g, ''));
    return text
      ? { ...empty, text }
      : { ...empty, error: true, text: 'TukAI could not answer just now.' };
  }

  const cards = (Array.isArray(json.cards) ? json.cards : [])
    .map((c: any) => (typeof c === 'string' ? c : c?.id))
    .filter(known)
    .filter((id: string, i: number, all: string[]) => all.indexOf(id) === i)
    .slice(0, MAX_CARDS);

  let plan: TukaiPlan | null = null;
  if (json.plan && Array.isArray(json.plan.days)) {
    const days = json.plan.days
      .map((d: any) => ({
        title: cleanTukaiText(d?.title),
        stops: (Array.isArray(d?.stops) ? d.stops : [])
          .filter((x: any) => x && known(x.id))
          .slice(0, MAX_STOPS_A_DAY)
          .map((x: any) => ({
            id: x.id,
            time: cleanTime(x.time),
            end: cleanTime(x.end),
            note: cleanTukaiText(x.note),
          })),
      }))
      .filter((d: { stops: TukaiPlanStop[] }) => d.stops.length);
    if (days.length) {
      plan = {
        title: cleanTukaiText(json.plan.title) || 'Your plan',
        days: days.slice(0, MAX_PLAN_DAYS),
        tip: json.plan.tip ? cleanTukaiText(json.plan.tip) : '',
      };
    }
  }

  let draft: TukaiDraft | null = null;
  if (json.draft?.title && ownedCommunityIds.length) {
    const d = json.draft;
    const placeId = d.placeId && catalogue[d.placeId]?.kind === 'place' ? d.placeId : null;
    draft = {
      title: cleanTukaiText(d.title).slice(0, 80),
      desc: cleanTukaiText(d.description || d.desc),
      type: ['one', 'multi', 'itin'].includes(d.type) ? d.type : 'one',
      placeId,
      date: /^\d{4}-\d{2}-\d{2}$/.test(String(d.date || '')) ? d.date : '',
      start: cleanTime(d.start),
      end: cleanTime(d.end),
      price: Math.max(0, Math.round(Number(d.price) || 0)),
      commId: ownedCommunityIds.includes(d.commId) ? d.commId : ownedCommunityIds[0],
    };
  }

  let writing: TukaiWriting | null = null;
  if (json.writing && Array.isArray(json.writing.options)) {
    const options = json.writing.options.map(cleanTukaiText).filter(Boolean).slice(0, 3);
    if (options.length) {
      writing = {
        label: cleanTukaiText(json.writing.label) || 'Options',
        kind: String(json.writing.kind || ''),
        options,
      };
    }
  }

  const suggestions = (Array.isArray(json.suggestions) ? json.suggestions : [])
    .map(cleanTukaiText)
    .filter(Boolean)
    .slice(0, 3);

  return { text: cleanTukaiText(json.reply), cards, plan, draft, writing, suggestions };
};

/** Every catalogue id a reply points at, cards first, then plan stops and the draft's place. */
export const idsInReply = (reply: Omit<TukaiReply, 'items'>): string[] => {
  const ids = new Set<string>(reply.cards);
  reply.plan?.days.forEach((d) => d.stops.forEach((s) => ids.add(s.id)));
  if (reply.draft?.placeId) ids.add(reply.draft.placeId);
  return Array.from(ids);
};

export type TukaiPin = {
  id: string;
  n: number;
  day: number;
  lat: number;
  lng: number;
  title: string;
  sub: string;
  img: string;
  kind: string;
  meta: string;
  fact: string;
  when: string;
};

/** "Itinerary", "Experience", "Community", or a place's own category. */
export const itemKindLabel = (item: TukaiItem): string =>
  item.kind === 'place'
    ? item.category || 'Place'
    : item.kind === 'community'
      ? 'Community'
      : item.isItinerary
        ? 'Itinerary'
        : 'Experience';

/**
 * The map pins for one reply, numbered in the reply's order: plan stops day
 * by day, otherwise the cards. The same numbers go on the cards and stops.
 * Items without coordinates get no pin and no number.
 */
export const tukaiPins = (
  message: TukaiMessage,
): { numbers: Record<string, number>; pins: TukaiPin[] } => {
  const numbers: Record<string, number> = {};
  const pins: TukaiPin[] = [];
  const items = message.items ?? {};
  const add = (id: string, day: number, stops?: TukaiPlanStop[], index?: number) => {
    const item = items[id];
    if (numbers[id] || !item || item.lat == null || item.lng == null) return;
    const n = pins.length + 1;
    numbers[id] = n;
    const stop = stops && index != null ? stops[index] : null;
    const end = stops && index != null ? stopEnd(stops, index) : '';
    pins.push({
      id,
      n,
      day,
      lat: item.lat,
      lng: item.lng,
      title: item.title,
      sub: item.area,
      img: item.photos[0] ?? '',
      kind: itemKindLabel(item),
      meta:
        item.kind === 'experience'
          ? item.area
          : [item.area, item.kind === 'community' ? item.sub : ''].filter(Boolean).join(' · '),
      fact: item.kind === 'experience' ? item.detail : '',
      when: day
        ? `Day ${day}${stop?.time ? ` · ${toTwelveHour(stop.time)}${end ? ` - ${toTwelveHour(end)}` : ''}` : ''}`
        : '',
    });
  };
  if (message.plan) {
    message.plan.days.forEach((d, di) =>
      d.stops.forEach((s, si) => add(s.id, di + 1, d.stops, si)),
    );
  } else {
    (message.cards ?? []).forEach((id) => add(id, 0));
  }
  return { numbers, pins };
};
