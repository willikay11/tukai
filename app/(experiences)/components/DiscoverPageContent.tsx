'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import moment from 'moment';

import { CommunityDiscoverCard } from '@/app/(experiences)/components/CommunityDiscoverCard';
import { ExperienceCard } from '@/app/(experiences)/components/ExperienceCard';
import { happeningSoon } from '@/app/(experiences)/components/ExperienceCard/happening-soon';
import { ItineraryCard } from '@/app/(experiences)/components/ItineraryCard';
import { MomentCard } from '@/app/(experiences)/components/MomentCard';
import { PlaceCard } from '@/app/(experiences)/components/PlaceCard';
import { SearchResults } from '@/app/(experiences)/components/SearchResults';
import { filtersFromParams, hasSearch } from '@/app/(experiences)/components/SearchResults/filters';
import { CityCard } from '@/app/(experiences)/experiences/components/CityCard';
import {
  ExperienceRow,
  RowSkeleton,
} from '@/app/(experiences)/experiences/components/ExperienceRow';
import { DEFAULT_CITY, cityExperiencesHref } from '@/app/(experiences)/experiences/see-all/config';
import { PageContainer } from '@/app/shared/components/Layout';
import { CardGrid, CardRail, SeeAllCard } from '@/app/shared/components/Lists';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useMoments } from '@/app/shared/hooks/useMoments';
import {
  useFeaturedPlaces,
  usePlaceCategories,
  usePlaces,
  usePlacesWithExperiences,
} from '@/app/shared/hooks/usePlaces';
import { useLocation } from '@/context/LocationContext';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Moment, momentPhotos } from '@/types/moment';
import { Photo } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceCategory, categoryImageOf } from '@/types/placeCategory';
import { formatLongDateWithOrdinal } from '@/utils/date-utils';

const ROW_SIZE = 10;

/**
 * How many experiences the "Happening soon" rail reads before narrowing to the
 * next fortnight. Wider than the nine it shows, because the API cannot be
 * asked for a date range and sorts by distance, not by date.
 */
const SOON_PAGE_SIZE = 50;

/** The canvas fills the "Places with experiences" grid five at a time. */
const PLACES_PER_PAGE = 5;

/** And the moments grid four at a time. */
const MOMENTS_PER_PAGE = 4;

const MOMENTS_SUBTITLE = 'Every moment is attached to a community, place or experience.';

/** Read in one go, then paged locally — the API pages by request. */
const PLACES_WITH_EXPERIENCES_SIZE = 30;

// First photo of a row's leading item, used as the See All tile's preview
const coverPhotoOf = (experience: Experience | undefined): string | null =>
  experience?.photos?.find((photo: Photo) => photo.isCover)?.photo ||
  experience?.photos?.[0]?.photo ||
  null;

const placePhotoOf = (place: Place | undefined): string | null =>
  place?.photos?.find((photo: Photo) => photo.isCover)?.photo || place?.photos?.[0]?.photo || null;

/**
 * How many cards in a horizontal row are fetched eagerly.
 *
 * A scroll row shows about three at once on a laptop and two on a phone;
 * anything past that is off-screen and stays lazy. Marking them `priority`
 * skips the lazy-load observer, which cannot fire until React has painted —
 * the reason the first row used to trickle in a card at a time.
 */
const EAGER_IN_ROW = 3;

export const DiscoverPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { city, lat, lng } = useLocation();

  // A search or a filter replaces the rails outright, as the canvas has it —
  // and it lives in the URL, so a result list is somewhere you can send
  // someone and the back button still means something
  const filters = filtersFromParams(searchParams);
  const isSearching = hasSearch(filters);

  const { data: promotedResponse, isLoading: isLoadingPromoted } = useFeaturedPlaces(!isSearching);
  const promotedPlaces: Place[] = promotedResponse?.data?.results ?? [];

  const { data: withExperiencesResponse, isLoading: isLoadingWithExperiences } =
    usePlacesWithExperiences(!isSearching, PLACES_WITH_EXPERIENCES_SIZE);
  const placesWithExperiences: Place[] = withExperiencesResponse?.data?.results ?? [];

  // ⚠️ `GET /experiences/` takes a single `date`, not a range, so "next 14
  // days" cannot be asked for — a wider page is read and narrowed by
  // happeningSoon(). Coordinates are omitted until the user grants location,
  // so the rail still renders unscoped if they decline.
  const { data: rowResponse, isLoading: isLoadingRow } = useExperiences(
    { page: 1, page_size: SOON_PAGE_SIZE, status: 'published', lat, long: lng },
    true,
  );
  const soonExperiences: Experience[] = happeningSoon(rowResponse?.data?.results ?? []);

  const { data: citiesResponse, isLoading: isLoadingCities } = usePlaceCategories(
    { pageSize: 100, group: 'cities' },
    true,
  );
  const allCities: PlaceCategory[] = (citiesResponse?.data?.results ?? [])
    .filter((category: PlaceCategory) => category.group === 'cities')
    .sort((a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount);
  const cities: PlaceCategory[] = allCities.slice(0, ROW_SIZE);

  const { data: momentsResponse, isLoading: isLoadingMoments } = useMoments({
    page: 1,
    page_size: ROW_SIZE,
  });
  // This row is photo-led. Media whose photo is null (a video, or an upload
  // still processing) cannot be rendered and would throw in next/image.
  const moments: Moment[] = (momentsResponse?.data?.results ?? []).filter(
    (moment: Moment) => momentPhotos(moment).length > 0,
  );

  const { data: communitiesResponse, isLoading: isLoadingCommunities } = useGetCommunities({
    page: 1,
    enabled: true,
    popularCommunities: true,
  });
  const communities: Community[] = communitiesResponse?.data?.results ?? [];

  // Same queries the /experiences rows issue
  const userCity = city ?? DEFAULT_CITY;
  const today = moment().format('YYYY-MM-DD');
  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

  const { data: todayResponse, isLoading: isLoadingToday } = useExperiences(
    { page: 1, page_size: 8, date: today },
    true,
  );
  const { data: tomorrowResponse, isLoading: isLoadingTomorrow } = useExperiences(
    { page: 1, page_size: 8, date: tomorrow },
    true,
  );

  // No itineraries endpoint exists, but the experiences list honours
  // experience_type server-side, so this is a real filter rather than a guess
  const { data: itinerariesResponse, isLoading: isLoadingItineraries } = useExperiences(
    { page: 1, page_size: ROW_SIZE, experience_type: 'itinerary' },
    true,
  );
  const itineraries: Experience[] = itinerariesResponse?.data?.results ?? [];

  // ⚠️ The places API ignores `popular` and `ordering` (verified: identical
  // count and order), so "Popular" is scoped to the user's city rather than
  // actually ranked. Reuses the city categories already fetched above.
  const userCityCategory = allCities.find(
    (category) => category.name.toLowerCase() === userCity.toLowerCase(),
  );
  const { data: popularPlacesResponse, isLoading: isFetchingPopularPlaces } = usePlaces({
    page: 1,
    enabled: Boolean(userCityCategory),
    categoryId: userCityCategory?.id,
  });
  const popularPlaces: Place[] = popularPlacesResponse?.data?.results ?? [];
  // A disabled query reports isLoading false, so without folding in the
  // prerequisite the section would render nothing at all while it resolves
  const isLoadingPopularPlaces = isLoadingCities || isFetchingPopularPlaces;

  const { data: interestsResponse, isLoading: isLoadingInterests } = usePlaceCategories(
    { pageSize: 100, group: 'interests' },
    true,
  );
  const restaurantCategoryId = (interestsResponse?.data?.results ?? []).find(
    (category: PlaceCategory) => category.name === 'Restaurants',
  )?.id;

  // ⚠️ No radius param exists — "Within 20 km" is copy; the API decides the
  // radius from lat/lng
  const { data: restaurantsResponse, isLoading: isFetchingRestaurants } = usePlaces({
    page: 1,
    enabled: Boolean(restaurantCategoryId),
    categoryId: restaurantCategoryId,
    lat,
    lng,
  });
  const nearbyRestaurants: Place[] = restaurantsResponse?.data?.results ?? [];
  const isLoadingRestaurants = isLoadingInterests || isFetchingRestaurants;

  if (isSearching) {
    return (
      <PageContainer className="py-6">
        <SearchResults filters={filters} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-10 py-6">
      {/* The canvas opens Discover with this row, off its own `featured`
          flag. The row stays out of the way entirely when nothing is
          featured — see useFeaturedPlaces. */}
      {(isLoadingPromoted || promotedPlaces.length > 0) && (
        <CardRail title="Promoted places" subtitle="Handpicked by the communities that run them">
          {isLoadingPromoted ? (
            <RowSkeleton cardClassName="aspect-square w-[184px]" />
          ) : (
            <>
              {promotedPlaces.map((place, index) => (
                <PlaceCard key={place.id} place={place} priority={index < EAGER_IN_ROW} />
              ))}

              <SeeAllCard
                href="/places"
                previewPhotos={promotedPlaces.slice(0, 3).map(placePhotoOf)}
              />
            </>
          )}
        </CardRail>
      )}

      {(isLoadingRow || soonExperiences.length > 0) && (
        <CardRail title="Happening soon" subtitle={`In ${userCity}, next 14 days`}>
          {isLoadingRow ? (
            <RowSkeleton cardClassName="aspect-square w-[184px]" />
          ) : (
            <>
              {soonExperiences.map((experience, index) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  priority={index < EAGER_IN_ROW}
                />
              ))}

              <SeeAllCard
                href="/experiences"
                previewPhotos={soonExperiences.slice(0, 3).map(coverPhotoOf)}
              />
            </>
          )}
        </CardRail>
      )}

      {/* The canvas lays this one out as a grid the header's arrows page,
          not as a rail. `has_experiences=true` is exactly what the heading
          says, so the section is the honest one of the two.

          ⚠️ The canvas also draws a "Closed · Opens 10 AM" pill over each
          photo here. Hours are not on the place list serializer — they hang
          off a reservation profile, two requests per place — so the pill is
          left to the detail page, where PlaceOpenStatus can afford them. */}
      {(isLoadingWithExperiences || placesWithExperiences.length > 0) && (
        <section>
          {isLoadingWithExperiences ? (
            <CardRail
              title="Places with experiences"
              subtitle="Each one shows what is happening inside"
            >
              <RowSkeleton cardClassName="aspect-square w-[184px]" />
            </CardRail>
          ) : (
            <CardGrid
              title="Places with experiences"
              subtitle="Each one shows what is happening inside"
              items={placesWithExperiences}
              pageSize={PLACES_PER_PAGE}
              getKey={(place) => place.id}
              renderItem={(place, index) => (
                <PlaceCard place={place} priority={index < EAGER_IN_ROW} className="w-full" />
              )}
            />
          )}
        </section>
      )}

      {/* Discover by City */}
      {(isLoadingCities || cities.length > 0) && (
        <CardRail title="Discover by City" subtitle="Where will you go next?">
          {isLoadingCities ? (
            <RowSkeleton cardClassName="h-[130px] w-[240px]" />
          ) : (
            <>
              {cities.map((category) => (
                <div key={category.id} className="snap-start">
                  <CityCard
                    city={category.name}
                    imageUrl={categoryImageOf(category) ?? ''}
                    href={cityExperiencesHref(category.name)}
                  />
                </div>
              ))}

              <SeeAllCard
                href="/experiences/see-all?type=cities"
                previewPhotos={cities.slice(0, 3).map(categoryImageOf)}
                className="aspect-auto h-[130px] w-[240px]"
              />
            </>
          )}
        </CardRail>
      )}

      {/* The canvas lays moments out as a square grid the header's arrows
          page — not the masonry the Moments page uses, which was going into a
          horizontally scrolling rail here. */}
      {(isLoadingMoments || moments.length > 0) && (
        <section>
          {isLoadingMoments ? (
            <CardRail title="Recent moments" subtitle={MOMENTS_SUBTITLE}>
              <RowSkeleton cardClassName="aspect-square w-[184px]" />
            </CardRail>
          ) : (
            <CardGrid
              title="Recent moments"
              subtitle={MOMENTS_SUBTITLE}
              items={moments}
              pageSize={MOMENTS_PER_PAGE}
              getKey={(moment) => moment.id}
              renderItem={(moment, index) => (
                <MomentCard
                  moment={moment}
                  priority={index < EAGER_IN_ROW}
                  onClick={() => router.push(`/moments?momentId=${moment.id}`)}
                />
              )}
            />
          )}
        </section>
      )}

      {/* Discover Communities */}
      {(isLoadingCommunities || communities.length > 0) && (
        <CardRail title="Discover Communities" subtitle="Find your crew">
          {isLoadingCommunities ? (
            <RowSkeleton cardClassName="h-[180px] w-[320px]" />
          ) : (
            <>
              {communities.map((community, index) => (
                <CommunityDiscoverCard
                  key={community.id}
                  community={community}
                  priority={index < EAGER_IN_ROW}
                />
              ))}

              <SeeAllCard
                href="/communities"
                previewPhotos={communities
                  .slice(0, 3)
                  .map((community) => community.photos?.[0]?.photo ?? null)}
                className="aspect-auto h-[180px] w-[320px]"
              />
            </>
          )}
        </CardRail>
      )}

      <ExperienceRow
        title="Happening Today"
        subtitle={formatLongDateWithOrdinal(new Date())}
        seeAllHref="/experiences/see-all?type=today"
        total={todayResponse?.data?.count}
        experiences={todayResponse?.data?.results ?? []}
        isLoading={isLoadingToday}
      />

      <ExperienceRow
        title={`Happening Tomorrow in ${userCity}`}
        subtitle={formatLongDateWithOrdinal(moment().add(1, 'days').toDate())}
        seeAllHref={`/experiences/see-all?type=tomorrow&city=${encodeURIComponent(userCity)}`}
        total={tomorrowResponse?.data?.count}
        experiences={tomorrowResponse?.data?.results ?? []}
        isLoading={isLoadingTomorrow}
      />

      {/* Discover Itineraries */}
      {(isLoadingItineraries || itineraries.length > 0) && (
        <CardRail title="Discover Itineraries" subtitle="Ready-to-book plans from TukAI">
          {isLoadingItineraries ? (
            <RowSkeleton cardClassName="aspect-[4/3] w-[300px]" />
          ) : (
            <>
              {itineraries.map((itinerary) => (
                <ItineraryCard key={itinerary.id} itinerary={itinerary} />
              ))}

              {/* Only when the row came back full: a partial row is already
                  every itinerary there is, so "See all" would lead to the same
                  cards the reader is looking at */}
              {itineraries.length >= ROW_SIZE && (
                <SeeAllCard
                  href="/experiences/see-all?type=itineraries"
                  previewPhotos={itineraries.slice(0, 3).map(coverPhotoOf)}
                  className="w-[300px]"
                />
              )}
            </>
          )}
        </CardRail>
      )}

      {/* Popular Places */}
      {(isLoadingPopularPlaces || popularPlaces.length > 0) && (
        <CardRail title={`Popular Places in ${userCity}`} subtitle="Loved by the community">
          {isLoadingPopularPlaces ? (
            <RowSkeleton />
          ) : (
            <>
              {popularPlaces.map((place, index) => (
                <PlaceCard key={place.id} place={place} priority={index < EAGER_IN_ROW} />
              ))}

              <SeeAllCard
                href="/places"
                previewPhotos={popularPlaces.slice(0, 3).map(placePhotoOf)}
              />
            </>
          )}
        </CardRail>
      )}

      {/* Nearby Restaurants */}
      {(isLoadingRestaurants || nearbyRestaurants.length > 0) && (
        <CardRail title="Nearby Restaurants" subtitle="Within 20 km of you">
          {isLoadingRestaurants ? (
            <RowSkeleton />
          ) : (
            <>
              {nearbyRestaurants.map((place, index) => (
                <PlaceCard key={place.id} place={place} priority={index < EAGER_IN_ROW} />
              ))}

              <SeeAllCard
                href="/places"
                previewPhotos={nearbyRestaurants.slice(0, 3).map(placePhotoOf)}
              />
            </>
          )}
        </CardRail>
      )}
    </PageContainer>
  );
};
