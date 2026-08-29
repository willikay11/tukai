'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import moment from 'moment';

import { CommunityDiscoverCard } from '@/app/(experiences)/components/CommunityDiscoverCard';
import { ItineraryCard } from '@/app/(experiences)/components/ItineraryCard';
import { PlaceCard } from '@/app/(experiences)/components/PlaceCard';
import { CityCard } from '@/app/(experiences)/experiences/components/CityCard';
import {
  ExperienceRow,
  RowSkeleton,
} from '@/app/(experiences)/experiences/components/ExperienceRow';
import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { DEFAULT_CITY, cityExperiencesHref } from '@/app/(experiences)/experiences/see-all/config';
import { FeaturedBanner } from '@/app/shared/components/Banners';
import { SingleExperience } from '@/app/shared/components/Experiences/Single';
import { PageContainer } from '@/app/shared/components/Layout';
import { ScrollRow, SeeAllCard } from '@/app/shared/components/Lists';
import { MomentsMasonry } from '@/app/shared/components/Moments';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useMoments } from '@/app/shared/hooks/useMoments';
import { usePlaceCategories, usePlaces } from '@/app/shared/hooks/usePlaces';
import { useLocation } from '@/context/LocationContext';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Moment, momentPhotos } from '@/types/moment';
import { Photo } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceCategory, categoryImageOf } from '@/types/placeCategory';
import { formatLongDateWithOrdinal, formatShortDate } from '@/utils/date-utils';
import { haversineKm } from '@/utils/geo-utils';

const ROW_SIZE = 10;

// First photo of a row's leading item, used as the See All tile's preview
const coverPhotoOf = (experience: Experience | undefined): string | null =>
  experience?.photos?.find((photo: Photo) => photo.isCover)?.photo ||
  experience?.photos?.[0]?.photo ||
  null;

const placePhotoOf = (place: Place | undefined): string | null =>
  place?.photos?.find((photo: Photo) => photo.isCover)?.photo || place?.photos?.[0]?.photo || null;

export const DiscoverPageContent = () => {
  const router = useRouter();
  const { city, lat, lng } = useLocation();

  // ⚠️ No featured endpoint and no is_featured param exist — the first row of
  // the default list stands in, matching what /experiences and the Places
  // featured banner already do.
  const { data: featuredResponse, isLoading: isLoadingFeatured } = useExperiences(
    { page: 1, page_size: 1 },
    true,
  );
  const featured: Experience | undefined = featuredResponse?.data?.results?.[0];

  // ⚠️ No handpicked/recommended/for-you endpoint exists. Geo-scoped published
  // experiences are the closest available query; coordinates are omitted until
  // the user grants location, so the row still renders unscoped if they decline.
  const { data: rowResponse, isLoading: isLoadingRow } = useExperiences(
    { page: 1, page_size: ROW_SIZE, status: 'published', lat, long: lng },
    true,
  );
  const discoverExperiences: Experience[] = rowResponse?.data?.results ?? [];

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

  const coverPhoto =
    featured?.photos?.find((photo: Photo) => photo.isCover)?.photo ||
    featured?.photos?.[0]?.photo ||
    null;

  const featuredLat = featured?.location?.pointLat;
  const featuredLng = featured?.location?.pointLong;
  const distanceKm =
    lat !== undefined && lng !== undefined && featuredLat && featuredLng
      ? haversineKm(lat, lng, featuredLat, featuredLng)
      : null;

  // Every piece is dropped rather than faked when the API omits it
  const metaItems = [
    featured?.location?.city,
    distanceKm !== null ? `${distanceKm} Kms` : null,
    featured?.startDate ? formatShortDate(featured.startDate) : null,
  ].filter(Boolean) as string[];

  const price = featured?.priceStartsFrom;

  return (
    <PageContainer className="space-y-10 py-6">
      {isLoadingFeatured ? (
        <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-gray-200 md:aspect-[3/1]" />
      ) : (
        featured && (
          <FeaturedBanner
            badgeLabel="Featured This Weekend"
            badgeIcon="SparklesIcon"
            coverPhoto={coverPhoto}
            title={featured.title}
            metaItems={metaItems}
            // ⚠️ No rating: the Experience type carries no averageRating /
            // totalReviews field (only Place does), so the star in the design
            // has no backing data. FeaturedBanner omits it when null.
            rating={null}
            ctaLabel={`Reserve a spot - ${price?.currency} ${Number(price?.amount ?? 0).toLocaleString()}`}
            // No reserve route exists — booking lives in the detail page panel
            onCtaClick={() => router.push(`/experiences/${featured.id}`)}
            secondaryCtaLabel="View details"
            onSecondaryCtaClick={() => router.push(`/experiences/${featured.id}`)}
          />
        )
      )}

      {(isLoadingRow || discoverExperiences.length > 0) && (
        <section>
          <SectionHeader
            icon="Compass01Icon"
            title="Discover Experiences"
            subtitle="Handpicked for you"
          />
          {isLoadingRow ? (
            <RowSkeleton />
          ) : (
            <ScrollRow>
              {discoverExperiences.map((experience) => (
                <div key={experience.id} className="w-[280px] flex-shrink-0 snap-start">
                  <Link target="_blank" href={`/experiences/${experience.id}`}>
                    <SingleExperience type="discover" variant="row" experience={experience} />
                  </Link>
                </div>
              ))}

              <SeeAllCard
                href="/experiences/see-all?type=near-me"
                previewPhotos={discoverExperiences.slice(0, 3).map(coverPhotoOf)}
              />
            </ScrollRow>
          )}
        </section>
      )}

      {/* Discover by City */}
      {(isLoadingCities || cities.length > 0) && (
        <section>
          <SectionHeader
            icon="Location01Icon"
            title="Discover by City"
            subtitle="Where will you go next?"
          />
          {isLoadingCities ? (
            <RowSkeleton cardClassName="h-[130px] w-[240px]" />
          ) : (
            <ScrollRow>
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
            </ScrollRow>
          )}
        </section>
      )}

      {/* Moments */}
      {(isLoadingMoments || moments.length > 0) && (
        <section>
          <SectionHeader
            icon="Camera01Icon"
            title="Moments"
            subtitle="Fresh from the community"
            // ⚠️ /moments does not exist yet — the nav already links there too
            seeAllHref="/moments"
          />
          {isLoadingMoments ? (
            <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
              {[220, 300, 180, 260].map((height, index) => (
                <div
                  key={index}
                  style={{ height }}
                  className="mb-4 w-full animate-pulse break-inside-avoid rounded-2xl bg-gray-200"
                />
              ))}
            </div>
          ) : (
            /* The same masonry the Moments page uses, given a wider column
               count because this section spans the full content width */
            <MomentsMasonry
              moments={moments}
              selectedId={null}
              onSelect={(id) => router.push(`/moments?momentId=${id}`)}
              onLoadMore={() => {}}
              hasMore={false}
              isLoadingMore={false}
              columnsClassName="columns-2 gap-4 md:columns-3 lg:columns-4"
            />
          )}
        </section>
      )}

      {/* Discover Communities */}
      {(isLoadingCommunities || communities.length > 0) && (
        <section>
          <SectionHeader
            icon="UserGroupIcon"
            title="Discover Communities"
            subtitle="Find your crew"
          />
          {isLoadingCommunities ? (
            <RowSkeleton cardClassName="h-[180px] w-[320px]" />
          ) : (
            <ScrollRow>
              {communities.map((community) => (
                <CommunityDiscoverCard key={community.id} community={community} />
              ))}

              <SeeAllCard
                href="/communities"
                previewPhotos={communities
                  .slice(0, 3)
                  .map((community) => community.photos?.[0]?.photo ?? null)}
                className="aspect-auto h-[180px] w-[320px]"
              />
            </ScrollRow>
          )}
        </section>
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
        <section>
          <SectionHeader
            icon="SparklesIcon"
            iconBgClass="bg-purple-100"
            iconColorClass="text-purple-600"
            title="Discover Itineraries"
            subtitle="Ready-to-book plans from TukAI"
          />
          {isLoadingItineraries ? (
            <RowSkeleton cardClassName="aspect-[4/3] w-[300px]" />
          ) : (
            <ScrollRow>
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
            </ScrollRow>
          )}
        </section>
      )}

      {/* Popular Places */}
      {(isLoadingPopularPlaces || popularPlaces.length > 0) && (
        <section>
          <SectionHeader
            icon="Fire03Icon"
            iconBgClass="bg-red-100"
            iconColorClass="text-red-500"
            title={`Popular Places in ${userCity}`}
            subtitle="Loved by the community"
          />
          {isLoadingPopularPlaces ? (
            <RowSkeleton />
          ) : (
            <ScrollRow>
              {popularPlaces.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}

              <SeeAllCard
                href="/places"
                previewPhotos={popularPlaces.slice(0, 3).map(placePhotoOf)}
              />
            </ScrollRow>
          )}
        </section>
      )}

      {/* Nearby Restaurants */}
      {(isLoadingRestaurants || nearbyRestaurants.length > 0) && (
        <section>
          <SectionHeader
            icon="Restaurant02Icon"
            iconBgClass="bg-orange-100"
            iconColorClass="text-orange-500"
            title="Nearby Restaurants"
            subtitle="Within 20 km of you"
          />
          {isLoadingRestaurants ? (
            <RowSkeleton />
          ) : (
            <ScrollRow>
              {nearbyRestaurants.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}

              <SeeAllCard
                href="/places"
                previewPhotos={nearbyRestaurants.slice(0, 3).map(placePhotoOf)}
              />
            </ScrollRow>
          )}
        </section>
      )}
    </PageContainer>
  );
};
