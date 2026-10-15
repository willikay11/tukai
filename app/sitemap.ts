import type { MetadataRoute } from 'next';

import { fetchExperiences } from '@/services/experience';
import { fetchPlaces } from '@/services/place';
import { Experience } from '@/types/experience';
import { Place } from '@/types/place';
import { experiencePath, placePath } from '@/utils/detail-paths';
import { APP_ORIGIN } from '@/utils/share-metadata';

// Regenerated hourly rather than on every request - a sitemap this size does
// not need to be second-fresh, and the API should not pay for a full re-crawl
// per hit
export const revalidate = 3600;

const PAGE_SIZE = 100;

const allExperiences = async (): Promise<Experience[]> => {
  const all: Experience[] = [];
  let page = 1;

  for (;;) {
    const response = await fetchExperiences({ status: 'published', page, page_size: PAGE_SIZE });
    const results: Experience[] = response.data?.results ?? [];
    all.push(...results);
    if (results.length < PAGE_SIZE) break;
    page += 1;
  }

  // Published still includes a private link-only experience, or one sold out
  // outright - neither is worth a crawler's time, and the detail page itself
  // noindexes the private ones anyway (see generateMetadata there)
  return all.filter((experience) => experience.isPublic && !experience.isSoldOut);
};

const allPlaces = async (): Promise<Place[]> => {
  const all: Place[] = [];
  let page = 1;

  for (;;) {
    const response = await fetchPlaces(page, PAGE_SIZE);
    const results: Place[] = response.data?.results ?? [];
    all.push(...results);
    if (results.length < PAGE_SIZE) break;
    page += 1;
  }

  return all;
};

const STATIC_ROUTES: {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  priority: number;
}[] = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/places', changeFrequency: 'daily', priority: 0.9 },
  { path: '/communities', changeFrequency: 'daily', priority: 0.7 },
  { path: '/moments', changeFrequency: 'daily', priority: 0.6 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
];

// eslint-disable-next-line import/no-default-export -- Next's sitemap.ts file convention requires one
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Neither list can be allowed to take the whole sitemap down with it - a
  // slow or failing API still leaves the static routes crawlable
  const [experiences, places] = await Promise.all([
    allExperiences().catch(() => []),
    allPlaces().catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${APP_ORIGIN}${path}`,
      changeFrequency,
      priority,
    }),
  );

  const experienceEntries: MetadataRoute.Sitemap = experiences.map((experience) => ({
    url: `${APP_ORIGIN}${experiencePath(experience)}`,
    lastModified: experience.dateUpdated ?? experience.dateCreated,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const placeEntries: MetadataRoute.Sitemap = places.map((place) => ({
    url: `${APP_ORIGIN}${placePath(place)}`,
    lastModified: place.dateCreated,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...experienceEntries, ...placeEntries];
}
