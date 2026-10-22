'use client';

import { useMemo } from 'react';

import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { usePlaces } from '@/app/shared/hooks/usePlaces';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Place } from '@/types/place';
import { coverPhotoUrl } from '@/types/photo';
import { formatShortDate } from '@/utils/date-utils';

import type { AttachmentKind } from './useMomentComposer';

export interface MomentAttachOption {
  id: string;
  label: string;
  meta: string;
  thumb?: string;
}

// The canvas shows 8 rows unsearched, 20 while searching; every list beyond
// that is told how many more there are rather than loaded
const NARROW_LIMIT = 8;
const SEARCH_LIMIT = 20;

/**
 * The options one attach tile's picker offers, for whichever kind is open.
 *
 * All three underlying queries are called unconditionally - only the one for
 * the open kind is `enabled` - because hooks cannot be called conditionally.
 * Experiences and places search everything on Tukai; communities are only
 * the ones this reader joined or runs.
 */
export const useMomentAttachSearch = (kind: AttachmentKind, query: string) => {
  const normalized = query.trim();
  const isSearching = normalized.length > 0;
  const limit = isSearching ? SEARCH_LIMIT : NARROW_LIMIT;

  const { data: experiencesResponse, isFetching: isFetchingExperiences } = useExperiences(
    { page: 1, page_size: limit, search: normalized || undefined },
    kind === 'experience',
  );

  const { data: communitiesResponse, isFetching: isFetchingCommunities } = useGetCommunities({
    page: 1,
    enabled: kind === 'community',
    following: true,
    search: normalized || undefined,
  });

  const { data: placesResponse, isFetching: isFetchingPlaces } = usePlaces({
    page: 1,
    enabled: kind === 'place',
    search: normalized || undefined,
  });

  const total: number =
    kind === 'experience'
      ? experiencesResponse?.data?.count ?? 0
      : kind === 'community'
        ? communitiesResponse?.data?.count ?? 0
        : placesResponse?.data?.count ?? 0;

  const options: MomentAttachOption[] = useMemo(() => {
    if (kind === 'experience') {
      const experiences: Experience[] = experiencesResponse?.data?.results ?? [];
      return experiences.slice(0, limit).map((experience) => ({
        id: experience.id,
        label: experience.title,
        meta: formatShortDate(experience.startDate),
        thumb: coverPhotoUrl(experience.photos, 'thumb'),
      }));
    }

    if (kind === 'community') {
      const communities: Community[] = communitiesResponse?.data?.results ?? [];
      return communities.slice(0, limit).map((community) => ({
        id: community.id,
        label: community.title,
        meta: `${community.membersCount ?? 0} members`,
        thumb: coverPhotoUrl(community.photos, 'thumb'),
      }));
    }

    const places: Place[] = placesResponse?.data?.results ?? [];
    return places.slice(0, limit).map((place) => ({
      id: place.id,
      label: place.title,
      meta: [place.categories?.[0]?.name, place.location?.city].filter(Boolean).join(' · '),
      thumb: coverPhotoUrl(place.photos, 'thumb'),
    }));
  }, [kind, limit, experiencesResponse, communitiesResponse, placesResponse]);

  const isLoading =
    kind === 'experience'
      ? isFetchingExperiences
      : kind === 'community'
        ? isFetchingCommunities
        : isFetchingPlaces;

  // Nothing joined at all - distinct from a search with no matches
  const hasNoCommunities = kind === 'community' && !isSearching && !isLoading && options.length === 0;

  return { options, total, isLoading, isSearching, hasNoCommunities };
};
