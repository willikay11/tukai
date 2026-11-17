'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { experienceRunBy } from '@/app/(experiences)/components/ExperienceCard/experience-flag';
import { placeLocality } from '@/app/(experiences)/components/PlaceCard/place-fact';
import { savedLine } from '@/app/(experiences)/experiences/components/BucketListCard/bucket-list-card';
import { DEFAULT_CITY } from '@/app/(experiences)/experiences/see-all/config';
import { usePublicBucketLists } from '@/app/shared/hooks/useBucketLists';
import { useGetCommunities, useMyCommunities } from '@/app/shared/hooks/useCommunities';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { usePlaceCategories, usePopularPlacesInCategory } from '@/app/shared/hooks/usePlaces';
import { useBucketListDrawer } from '@/context/BucketListDrawerContext';
import { useCommunityDrawer } from '@/context/CommunityDrawerContext';
import { useExperienceDrawer } from '@/context/ExperienceDrawerContext';
import { useLocation } from '@/context/LocationContext';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { BucketList, bucketListCoverPhoto } from '@/types/bucket-list';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Location } from '@/types/location';
import { coverPhotoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';
import { linkedUserName } from '@/types/user';
import { CANVAS_ICONS } from '@/utils/canvas-icons';
import { formatCardDateTime } from '@/utils/date-utils';
import { communityPath, experiencePath, placePath } from '@/utils/detail-paths';

import { PopularRailKind } from '../feed-blocks';

/** One row in a popular rail: a photo, a name, a line under it and a fact. */
export type PopularItem = {
  id: string;
  name: string;
  photo: string | null | undefined;
  secondLine?: string;
  meta?: {
    text: string;
    icon: string;
    /** Ink for a rating, green for something you are part of or a date, muted otherwise. */
    tone: 'ink' | 'brand' | 'muted';
  };
  onOpen: () => void;
};

export type PopularRail = {
  title: string;
  subtitle: string;
  /** Names the arrows: "Previous restaurants". */
  noun: string;
  items: PopularItem[];
  isLoading: boolean;
};

/** Read in one go; the rail pages through them eight at a time. */
const RAIL_POOL_SIZE = 24;

/** The same page Discover's Happening soon reads, so the two share a cache entry. */
const EXPERIENCES_POOL_SIZE = 50;

/**
 * Whether something is in the reader's city.
 *
 * ⚠️ None of these list endpoints filters by city, so the page is narrowed
 * here. `city` is free text on a location ("Nairobi", "Nairobi County"), so
 * this matches on containment across the fields a city can turn up in.
 */
const isInCity = (location: Location | undefined | null, city: string): boolean => {
  const wanted = city.trim().toLowerCase();
  if (!wanted || !location) return false;

  return [location.city, location.state, location.formattedAddress].some((field) =>
    field?.toLowerCase().includes(wanted),
  );
};

const placeInCity = (place: Place, city: string): boolean =>
  isInCity(place.location, city) ||
  (place.categories ?? []).some(
    (category) =>
      category.group === 'cities' && category.name.trim().toLowerCase() === city.toLowerCase(),
  );

const memberLine = (count: number): string =>
  `${count.toLocaleString('en-US')} ${count === 1 ? 'member' : 'members'}`;

/**
 * The four rails the Moments feed sets between its blocks: popular
 * restaurants, communities, bucket lists and experiences, each best first and
 * ready to draw.
 *
 * Off until the feed is long enough to need a rail, so a short feed asks for
 * none of it.
 */
export const usePopularRails = (enabled: boolean): Record<PopularRailKind, PopularRail> => {
  const router = useRouter();
  const { data: session } = useSession();
  const { city, lat, lng } = useLocation();
  const userCity = city ?? DEFAULT_CITY;

  const placeDrawer = usePlaceDrawer();
  const communityDrawer = useCommunityDrawer();
  const bucketListDrawer = useBucketListDrawer();
  const experienceDrawer = useExperienceDrawer();

  // Restaurants are an interest category like any other, found by name
  const { data: categoriesResponse, isLoading: isLoadingCategories } = usePlaceCategories(
    { pageSize: 100 },
    enabled,
  );
  const restaurantCategory = ((categoriesResponse?.data?.results ?? []) as PlaceCategory[]).find(
    (category) => category.group === 'interests' && /restaurant/i.test(category.name),
  );
  const { data: placesResponse, isLoading: isLoadingPlaces } = usePopularPlacesInCategory(
    restaurantCategory?.id,
    enabled,
  );

  const { data: communitiesResponse, isLoading: isLoadingCommunities } = useGetCommunities({
    page: 1,
    pageSize: RAIL_POOL_SIZE,
    enabled,
    popularCommunities: true,
  });
  const { owned, joined } = useMyCommunities(enabled ? session?.user?.id : null);
  const memberOf = new Set([...owned, ...joined].map((community) => community.id));

  const { data: listsResponse, isLoading: isLoadingLists } = usePublicBucketLists(
    enabled,
    RAIL_POOL_SIZE,
  );

  const { data: experiencesResponse, isLoading: isLoadingExperiences } = useExperiences(
    { page: 1, page_size: EXPERIENCES_POOL_SIZE, status: 'published', lat, long: lng },
    enabled,
  );

  // ⚠️ The canvas also marks a restaurant closed or closing soon. Hours are
  // not on the place list serializer - they hang off a reservation profile,
  // two requests per place - so the status is left to the place drawer.
  const restaurants: PopularItem[] = ((placesResponse?.data?.results ?? []) as Place[])
    .filter((place) => (place.totalReviews ?? 0) > 0 && placeInCity(place, userCity))
    .sort(
      (a, b) =>
        (b.totalReviews ?? 0) - (a.totalReviews ?? 0) ||
        (b.averageRating ?? 0) - (a.averageRating ?? 0),
    )
    .map((place) => ({
      id: place.id,
      name: place.title,
      photo: coverPhotoUrl(place.photos, 'thumb'),
      secondLine: placeLocality(place),
      meta: {
        text: `${place.averageRating.toFixed(1)} · ${(place.totalReviews ?? 0).toLocaleString('en-US')} reviews`,
        icon: CANVAS_ICONS.star,
        tone: 'ink',
      },
      onOpen: () => (placeDrawer ? placeDrawer.openPlace(place.id) : router.push(placePath(place))),
    }));

  const communities: PopularItem[] = ((communitiesResponse?.data?.results ?? []) as Community[])
    .filter((community) => isInCity(community.location, userCity))
    .sort((a, b) => (b.membersCount ?? 0) - (a.membersCount ?? 0))
    .map((community) => {
      const isMember = memberOf.has(community.id);
      return {
        id: community.id,
        name: community.title,
        photo: coverPhotoUrl(community.photos, 'thumb'),
        secondLine: community.membersCount
          ? memberLine(community.membersCount)
          : community.location?.city || undefined,
        meta: isMember
          ? { text: 'Member', icon: CANVAS_ICONS.check, tone: 'brand' }
          : { text: 'Anyone can join', icon: CANVAS_ICONS.users, tone: 'muted' },
        onOpen: () =>
          communityDrawer
            ? communityDrawer.openCommunity(community.id)
            : router.push(communityPath(community)),
      };
    });

  const bucketLists: PopularItem[] = ((listsResponse?.data?.results ?? []) as BucketList[])
    .filter((list) => list.visibility === 'public')
    .sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0))
    .map((list) => {
      const ownerName = list.owner ? linkedUserName(list.owner) : '';
      return {
        id: list.id,
        name: list.name,
        photo: bucketListCoverPhoto(list),
        secondLine: `By ${ownerName || 'Tukai'}`,
        meta: list.memberCount
          ? { text: memberLine(list.memberCount), icon: CANVAS_ICONS.users, tone: 'muted' }
          : { text: savedLine(list), icon: CANVAS_ICONS.list, tone: 'muted' },
        onOpen: () =>
          bucketListDrawer
            ? bucketListDrawer.openBucketList(list.id)
            : router.push(`/bucket-lists/${list.id}`),
      };
    });

  // ⚠️ The canvas ranks these by reviews, then date. The list serializer
  // carries no review count, so they run soonest first.
  const now = Date.now();
  const experiences: PopularItem[] = ((experiencesResponse?.data?.results ?? []) as Experience[])
    .filter(
      (experience) =>
        new Date(experience.startDate).getTime() >= now && isInCity(experience.location, userCity),
    )
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .map((experience) => {
      const when = formatCardDateTime(experience.startDate, experience.endDate);
      return {
        id: experience.id,
        name: experience.title,
        photo: coverPhotoUrl(experience.photos, 'thumb'),
        secondLine: experienceRunBy(experience),
        meta: when ? { text: when, icon: CANVAS_ICONS.calendar, tone: 'brand' } : undefined,
        onOpen: () =>
          experienceDrawer
            ? experienceDrawer.openExperience(experience.id)
            : router.push(experiencePath(experience)),
      };
    });

  return {
    restaurants: {
      title: 'Popular restaurants',
      subtitle: 'Ranked by reviews from people who have been',
      noun: 'restaurants',
      items: restaurants,
      isLoading: isLoadingCategories || (Boolean(restaurantCategory) && isLoadingPlaces),
    },
    communities: {
      title: 'Popular communities',
      subtitle: `The biggest groups in ${userCity}. Joining never books anything.`,
      noun: 'communities',
      items: communities,
      isLoading: isLoadingCommunities,
    },
    bucketLists: {
      title: 'Popular bucket lists',
      subtitle: 'Public lists with the most members',
      noun: 'bucket lists',
      items: bucketLists,
      isLoading: isLoadingLists,
    },
    experiences: {
      title: 'Popular experiences',
      subtitle: `What is coming up in ${userCity}`,
      noun: 'experiences',
      items: experiences,
      isLoading: isLoadingExperiences,
    },
  };
};
