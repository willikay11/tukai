import axios, { AxiosInstance } from 'axios';

import type { Community } from '@/types/community';
import type { Experience } from '@/types/experience';
import { photoUrl } from '@/types/photo';
import type { Place } from '@/types/place';
import type { TukaiItem } from '@/types/tukai';
import { parseSnakeToCamel } from '@/utils/parseSnakeToCamel';

/**
 * The slice of Tukai the model may recommend from, built on the server for
 * every message: what is near the person, plus what matches their question.
 * The model sees one line per entry; the app gets the entries themselves so
 * a reply can render its cards and pins.
 */
export type TukaiCatalogue = {
  items: Record<string, TukaiItem>;
  /** `id | type | name | category | area | details`, one per line. */
  text: string;
  /** The communities the person owns, which decide whether they can host. */
  ownedCommunities: { id: string; title: string }[];
  /** Ids of the experiences the person hosts. */
  hostedIds: string[];
};

const NEARBY = 30;
const MATCHES = 12;
const COMMUNITIES = 20;

const results = <T>(data: any): T[] => {
  const parsed = parseSnakeToCamel(data);
  return Array.isArray(parsed) ? parsed : (parsed?.results ?? []);
};

/** Swallows a failed list rather than failing the whole answer. */
const list = async <T>(client: AxiosInstance, path: string, params: Record<string, unknown>) => {
  try {
    const res = await client.get(path, { params });
    return results<T>(res.data);
  } catch (error: any) {
    console.error('TukAI catalogue:', path, error.response?.status || error.message);
    return [] as T[];
  }
};

const cut = (value: string | undefined, n: number) => {
  const t = String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > n ? `${t.slice(0, n - 3)}...` : t;
};

const areaOf = (loc?: {
  street?: string;
  city?: string;
  name?: string;
  formattedAddress?: string;
}) =>
  String(loc?.street || loc?.city || loc?.name || loc?.formattedAddress || '')
    .split(',')[0]
    .trim();

const coords = (loc?: { pointLat?: number; pointLong?: number }) => ({
  lat: typeof loc?.pointLat === 'number' ? loc.pointLat : null,
  lng: typeof loc?.pointLong === 'number' ? loc.pointLong : null,
});

const photos = (list?: Parameters<typeof photoUrl>[0][]) =>
  (list ?? [])
    .map((p) => photoUrl(p, 'md'))
    .filter((u): u is string => Boolean(u))
    .slice(0, 6);

/** "Sat 7 Nov, 6:00 AM" in Nairobi time, where every experience runs. */
const whenOf = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const day = d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Africa/Nairobi',
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  });
  return `${day.replace(',', '')}, ${time}`;
};

const priceOf = (e: Experience) =>
  !e.isPaid ? 'Free' : `KES ${Number(e.priceStartsFrom?.amount || 0).toLocaleString('en-US')}`;

const placeItem = (p: Place): TukaiItem => {
  const category = p.categories?.[0]?.name ?? 'Place';
  const area = areaOf(p.location);
  return {
    id: p.id,
    kind: 'place',
    title: p.title,
    sub: [category, area].filter(Boolean).join(' · '),
    category,
    area,
    photos: photos(p.photos),
    about: cut(p.description, 220),
    detail: '',
    ...coords(p.location),
    isRestaurant: (p.categories ?? []).some((c) => /restaurant|dining|eatery|caf/i.test(c.name)),
  };
};

const experienceItem = (e: Experience, userId: string | undefined): TukaiItem => {
  const category = e.categories?.[0]?.name ?? 'Experience';
  const area = areaOf(e.location);
  const isItinerary = e.experienceType === 'itinerary';
  return {
    id: e.id,
    kind: 'experience',
    isItinerary,
    title: e.title,
    sub: [category, area].filter(Boolean).join(' · '),
    category,
    area,
    photos: photos([...(e.photos ?? []), ...(e.place?.photos ?? [])]),
    about: cut(e.description, 220),
    detail: [whenOf(e.startDate), priceOf(e)].filter(Boolean).join(' · '),
    ...coords(e.location),
    isFree: !e.isPaid,
    isSoldOut: e.isSoldOut,
    isPast: new Date(e.endDate || e.startDate).getTime() < Date.now(),
    isMine: Boolean(userId && e.host?.id === userId),
  };
};

const communityItem = (c: Community): TukaiItem => {
  const area = areaOf(c.location) || 'Nairobi';
  const members = typeof c.membersCount === 'number' ? `${c.membersCount} members` : '';
  return {
    id: c.id,
    kind: 'community',
    title: c.title,
    sub: members || area,
    category: c.categories?.[0]?.name ?? 'Community',
    area,
    photos: photos(c.photos),
    about: cut(c.description, 220),
    detail: '',
    ...coords(c.location),
  };
};

const line = (item: TukaiItem, details: string[]) =>
  [
    item.id,
    item.kind,
    item.title.replace(/\|/g, '/'),
    (item.isItinerary ? 'itinerary, ' : '') + item.category,
    item.area,
    details.filter(Boolean).join('; '),
  ].join(' | ');

export const buildTukaiCatalogue = async ({
  accessToken,
  userId,
  question,
  lat,
  lng,
}: {
  accessToken?: string;
  userId?: string;
  question: string;
  lat?: number;
  lng?: number;
}): Promise<TukaiCatalogue> => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    timeout: 10_000,
  });

  const near = lat !== undefined && lng !== undefined ? { lat, long: lng } : {};
  // The question's own words widen the slice past what is nearby - "Naivasha"
  // from Nairobi should still find Naivasha
  const search = question.trim().slice(0, 80);

  const [places, placeHits, experiences, experienceHits, communities, owned] = await Promise.all([
    list<Place>(client, '/v1/places/', { page_size: NEARBY, ...near }),
    search
      ? list<Place>(client, '/v1/places/', { page_size: MATCHES, search })
      : Promise.resolve([]),
    list<Experience>(client, '/v1/experiences/', {
      status: 'published',
      page_size: NEARBY,
      ...near,
    }),
    search
      ? list<Experience>(client, '/v1/experiences/', {
          status: 'published',
          page_size: MATCHES,
          search,
        })
      : Promise.resolve([]),
    list<Community>(client, '/v1/communities/', { status: 'published', page_size: COMMUNITIES }),
    userId
      ? list<Community>(client, '/v1/communities/', {
          status: 'published',
          page_size: COMMUNITIES,
          created_by: userId,
        })
      : Promise.resolve([]),
  ]);

  const items: Record<string, TukaiItem> = {};
  const lines: string[] = [];
  const add = (item: TukaiItem, details: string[]) => {
    if (!item.id || items[item.id]) return;
    items[item.id] = item;
    lines.push(line(item, details));
  };

  [...places, ...placeHits].forEach((p) => {
    const item = placeItem(p);
    add(item, [
      (p.categories ?? []).map((c) => c.name).join(' '),
      p.averageRating ? `${p.averageRating} stars` : '',
      cut(p.description, 80),
    ]);
  });

  [...experiences, ...experienceHits].forEach((e) => {
    const item = experienceItem(e, userId);
    if (item.isPast) return;
    add(item, [
      item.detail,
      e.hostCommunity?.title ? `by ${e.hostCommunity.title}` : '',
      e.place?.title ? `at ${e.place.title}` : '',
      e.isSoldOut ? 'sold out' : '',
      item.isMine ? 'the user hosts this' : '',
    ]);
  });

  [...owned, ...communities].forEach((c) => {
    const item = communityItem(c);
    add(item, [cut(c.description, 80), item.sub]);
  });

  return {
    items,
    text: lines.join('\n'),
    ownedCommunities: owned.map((c) => ({ id: c.id, title: c.title })),
    hostedIds: Object.values(items)
      .filter((i) => i.isMine)
      .map((i) => i.id),
  };
};
