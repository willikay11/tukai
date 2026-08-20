'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import moment from 'moment';

import { CommunityDiscoverCard } from '@/app/(experiences)/components/CommunityDiscoverCard';
import { MomentRowCard } from '@/app/(experiences)/components/MomentRowCard';
import { CityCard } from '@/app/(experiences)/experiences/components/CityCard';
import { ExperienceRow } from '@/app/(experiences)/experiences/components/ExperienceRow';
import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { DEFAULT_CITY, cityExperiencesHref } from '@/app/(experiences)/experiences/see-all/config';
import { FeaturedBanner } from '@/app/shared/components/Banners';
import { SingleExperience } from '@/app/shared/components/Experiences/Single';
import { ScrollRow } from '@/app/shared/components/Lists';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useMoments } from '@/app/shared/hooks/useMoments';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { useLocation } from '@/context/LocationContext';
import { cn } from '@/lib/utils';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Moment } from '@/types/moment';
import { Photo } from '@/types/photo';
import { PlaceCategory } from '@/types/placeCategory';
import { formatLongDateWithOrdinal, formatShortDate } from '@/utils/date-utils';
import { haversineKm } from '@/utils/geo-utils';

const ROW_SIZE = 10;

const RowSkeleton = ({
  cardClassName = 'aspect-[4/3] w-[280px]',
  hideText = false,
}: {
  cardClassName?: string;
  hideText?: boolean;
}) => (
  <div className="flex gap-4 overflow-hidden">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex-shrink-0">
        <div className={cn('animate-pulse rounded-xl bg-gray-200', cardClassName)} />
        {!hideText && (
          <>
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
          </>
        )}
      </div>
    ))}
  </div>
);

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
  const cities: PlaceCategory[] = (citiesResponse?.data?.results ?? [])
    .filter((category: PlaceCategory) => category.group === 'cities')
    .sort((a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount)
    .slice(0, ROW_SIZE);

  const { data: momentsResponse, isLoading: isLoadingMoments } = useMoments({
    page: 1,
    page_size: ROW_SIZE,
  });
  // A moment can be posted without media; this row is photo-led, so those are
  // dropped rather than rendered as empty tiles
  const moments: Moment[] = (momentsResponse?.data?.results ?? []).filter(
    (moment: Moment) => moment.media?.length > 0,
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
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-6 md:px-6">
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
            seeAllHref="/experiences/see-all?type=near-me"
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
            seeAllHref="/experiences/see-all?type=cities"
          />
          {isLoadingCities ? (
            <RowSkeleton cardClassName="h-[130px] w-[240px]" />
          ) : (
            <ScrollRow>
              {cities.map((category) => (
                <div key={category.id} className="snap-start">
                  <CityCard
                    city={category.name}
                    experienceCount={category.placesCount}
                    imageUrl={category.image ?? ''}
                    href={cityExperiencesHref(category.name)}
                  />
                </div>
              ))}
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
            <RowSkeleton cardClassName="aspect-square w-[280px]" hideText />
          ) : (
            <ScrollRow>
              {moments.map((moment) => (
                <MomentRowCard
                  key={moment.id}
                  moment={moment}
                  onClick={() => router.push(`/moments?momentId=${moment.id}`)}
                />
              ))}
            </ScrollRow>
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
            seeAllHref="/communities"
          />
          {isLoadingCommunities ? (
            <RowSkeleton cardClassName="h-[180px] w-[320px]" />
          ) : (
            <ScrollRow>
              {communities.map((community) => (
                <CommunityDiscoverCard key={community.id} community={community} />
              ))}
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
    </main>
  );
};
