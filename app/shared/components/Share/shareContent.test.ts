import type { Community } from '@/types/community';
import type { Experience } from '@/types/experience';
import type { Moment } from '@/types/moment';
import type { Place } from '@/types/place';

import {
  communityShare,
  experienceShare,
  momentShare,
  placeShare,
  shareWhen,
} from './shareContent';

const photo = (url: string) => ({ id: url, mediaType: 'photo' as const, photo: url });

describe('placeShare', () => {
  const place = {
    id: 'p5',
    title: 'The Roastery',
    photos: [photo('https://img/roastery.jpg')],
    categories: [{ name: 'Cafe' }],
    location: { city: 'Westlands', formattedAddress: 'Westlands, Nairobi' },
  } as unknown as Place;

  it('says what the handoff says for a place', () => {
    expect(placeShare(place)).toMatchObject({
      heading: 'Share place',
      kind: 'Place',
      kindIcon: 'Location01Icon',
      title: 'The Roastery',
      sub: 'Cafe · Westlands',
      url: 'https://tukai.co/p/p5',
      lead: 'The Roastery on Tukai',
      isPrivate: false,
      note: 'Anyone with the link can see The Roastery, its hours and what is on there.',
    });
  });

  it('takes the area from the first part of the address where there is no city', () => {
    const { sub } = placeShare({
      ...place,
      location: { formattedAddress: 'Kilimani, Nairobi' } as Place['location'],
    });

    expect(sub).toBe('Cafe · Kilimani');
  });
});

describe('shareWhen', () => {
  it('reads as "Sat 24 Oct, 9:00 AM - 5:00 PM"', () => {
    expect(shareWhen('2026-10-24T09:00:00', '2026-10-24T17:00:00')).toBe(
      'Sat 24 Oct, 9:00 AM - 5:00 PM',
    );
  });

  it('names the end day when it runs past midnight', () => {
    expect(shareWhen('2026-10-24T20:00:00', '2026-10-25T02:00:00')).toBe(
      'Sat 24 Oct, 8:00 PM - Sun 25 Oct, 2:00 AM',
    );
  });

  it('says nothing without a start', () => {
    expect(shareWhen(null, null)).toBeUndefined();
  });
});

describe('experienceShare', () => {
  const experience = {
    id: 'e1',
    title: 'Karura sunrise hike',
    startDate: '2026-10-24T09:00:00',
    endDate: '2026-10-24T17:00:00',
    isPublic: true,
    isPaid: true,
    priceStartsFrom: { amount: 2000, currency: 'KES' },
    experienceType: 'standard',
    photos: [photo('https://img/hike.jpg')],
  } as unknown as Experience;

  it('says when and how much, in the sub and the lead', () => {
    expect(experienceShare(experience)).toMatchObject({
      heading: 'Share experience',
      kind: 'Experience',
      sub: 'Sat 24 Oct, 9:00 AM - 5:00 PM · KES 2,000',
      url: 'https://tukai.co/e/e1',
      lead: 'Karura sunrise hike, Sat 24 Oct, 9:00 AM - 5:00 PM on Tukai',
      isPrivate: false,
      note: 'Anyone with the link can see the details. Sharing never books a seat.',
    });
  });

  it('calls a free one free', () => {
    expect(experienceShare({ ...experience, isPaid: false }).sub).toMatch(/· Free$/);
  });

  it('calls an itinerary an itinerary', () => {
    expect(experienceShare({ ...experience, experienceType: 'itinerary' })).toMatchObject({
      heading: 'Share itinerary',
      kind: 'Itinerary',
    });
  });

  it('tells the sharer a forwarded private link grants nothing', () => {
    expect(experienceShare({ ...experience, isPublic: false })).toMatchObject({
      isPrivate: true,
      note: 'Only invited guests can open this link. A forwarded link grants nothing.',
    });
  });

  it('prefers a cover the caller already resolved', () => {
    expect(experienceShare({ ...experience, image: 'https://img/cover.jpg' }).image).toBe(
      'https://img/cover.jpg',
    );
  });
});

describe('communityShare', () => {
  const community = {
    id: 'c1',
    title: 'Nairobi Makers Circle',
    isPublic: true,
    membersCount: 128,
    location: { city: 'Westlands' },
    photos: [],
  } as unknown as Community;

  it('says how many members, and that joining is instant', () => {
    expect(communityShare(community)).toMatchObject({
      heading: 'Share community',
      kind: 'Community',
      kindIcon: 'UserMultipleIcon',
      sub: '128 members · Westlands',
      url: 'https://tukai.co/c/c1',
      note: 'Anyone with the link can see Nairobi Makers Circle and join. Joining is instant.',
    });
  });

  it('marks a private one, and points at inviting instead', () => {
    expect(communityShare({ ...community, isPublic: false })).toMatchObject({
      kind: 'Private community',
      kindIcon: 'SquareLock02Icon',
      isPrivate: true,
      note: 'Only members can open this link. To bring someone in, invite them from the community.',
    });
  });

  it('says one member, not one members', () => {
    expect(communityShare({ ...community, membersCount: 1 }).sub).toBe('1 member · Westlands');
  });
});

describe('momentShare', () => {
  const moment = {
    id: 'm1',
    author: { displayName: null, firstName: 'Asha', lastName: 'Kamau' },
    community: null,
    experience: null,
    place: { id: 'p5', title: 'The Roastery' },
    media: [{ id: 'x', mediaType: 'photo', photo: 'https://img/m1.jpg' }],
  } as unknown as Moment;

  it('names who posted it and what it is attached to', () => {
    expect(momentShare(moment)).toMatchObject({
      heading: 'Share moment',
      kind: 'Moment',
      image: 'https://img/m1.jpg',
      title: 'Moment by Asha Kamau',
      sub: 'The Roastery',
      url: 'https://tukai.co/m/m1',
      lead: 'A moment from The Roastery on Tukai',
      note: 'Anyone with the link can see this moment and The Roastery.',
    });
  });

  it('locks one in a private community', () => {
    expect(momentShare(moment, { title: 'Lavington Supper Society' })).toMatchObject({
      isPrivate: true,
      note: 'Only members of Lavington Supper Society can open this link. A forwarded link grants nothing.',
    });
  });
});

describe('the shared link', () => {
  // The slug reads well in a message; the id stays the fallback for records
  // without one, and the short-link routes resolve either
  it.each([
    [
      'place',
      placeShare({ id: 'p5', slug: 'the-roastery', title: 'The Roastery' }),
      '/p/the-roastery',
    ],
    [
      'experience',
      experienceShare({ id: 'e1', slug: 'sunrise-hike', title: 'Sunrise hike' }),
      '/e/sunrise-hike',
    ],
    [
      'community',
      communityShare({ id: 'c1', slug: 'nairobi-hikers', title: 'Nairobi hikers', isPublic: true }),
      '/c/nairobi-hikers',
    ],
  ])('carries the %s slug where it has one', (_kind, content, path) => {
    expect(content.url).toBe(`https://tukai.co${path}`);
  });

  it('falls back to the id where there is no slug', () => {
    expect(placeShare({ id: 'p5', slug: '', title: 'The Roastery' }).url).toBe(
      'https://tukai.co/p/p5',
    );
  });
});
