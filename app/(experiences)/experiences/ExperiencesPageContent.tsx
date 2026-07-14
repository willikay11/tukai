'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import moment from 'moment';

import { Experiences } from '@/app/(experiences)/experiences/components/List/experiences';
import { CityCard } from '@/app/(experiences)/experiences/components/CityCard';
import { FeaturedExperienceBanner } from '@/app/(experiences)/experiences/components/FeaturedExperienceBanner';
import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { SingleExperience } from '@/app/shared/components/Experiences/Single';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from '@/context/LocationContext';
import { Experience } from '@/types/experience';
import { PlaceCategory } from '@/types/placeCategory';
import { formatLongDateWithOrdinal } from '@/utils/date-utils';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'saved', label: 'Saved' },
  { value: 'hosting', label: 'Hosting' },
];

const CardRow = ({ children }: { children: React.ReactNode }) => (
  <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
    <CarouselContent>{children}</CarouselContent>
  </Carousel>
);

const RowSkeleton = ({ cardWidth = 280, cardHeight }: { cardWidth?: number; cardHeight?: number }) => (
  <div className="flex gap-4 overflow-hidden">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex-shrink-0" style={{ width: cardWidth }}>
        <div
          className="w-full animate-pulse rounded-xl bg-gray-200"
          style={cardHeight ? { height: cardHeight } : { aspectRatio: '4 / 3' }}
        />
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
      </div>
    ))}
  </div>
);

const ExperienceRow = ({
  title,
  subtitle,
  seeAllHref,
  experiences,
  isLoading,
}: {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  experiences: Experience[];
  isLoading: boolean;
}) => {
  // Hide the whole section when it loaded empty
  if (!isLoading && experiences.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader title={title} subtitle={subtitle} seeAllHref={seeAllHref} />
      {isLoading ? (
        <RowSkeleton />
      ) : (
        <CardRow>
          {experiences.map((experience) => (
            <CarouselItem key={experience.id} className="basis-auto">
              <div className="w-[280px]">
                <Link target="_blank" href={`/experiences/${experience.id}`}>
                  <SingleExperience type="discover" variant="row" experience={experience} />
                </Link>
              </div>
            </CarouselItem>
          ))}
        </CardRow>
      )}
    </section>
  );
};

export const ExperiencesPageContent = ({ initialCategory }: { initialCategory: string }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { city } = useLocation();
  const [activeTab, setActiveTab] = useState(
    TABS.some((tab) => tab.value === initialCategory) ? initialCategory : 'all',
  );

  const isAll = activeTab === 'all';
  const userCity = city ?? 'Nairobi';
  const today = moment().format('YYYY-MM-DD');
  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

  // No featured/nearby endpoints exist — the default list is the closest
  // available query: first result is the featured hero, the rest are "near you"
  const { data: discoverResponse, isLoading: isLoadingDiscover } = useExperiences(
    { page: 1, page_size: 9 },
    isAll,
  );
  const discoverExperiences: Experience[] = discoverResponse?.data?.results ?? [];
  const featuredExperience = discoverExperiences[0];
  const nearbyExperiences = discoverExperiences.slice(1);

  const { data: todayResponse, isLoading: isLoadingToday } = useExperiences(
    { page: 1, page_size: 8, date: today },
    isAll,
  );
  const { data: tomorrowResponse, isLoading: isLoadingTomorrow } = useExperiences(
    { page: 1, page_size: 8, date: tomorrow },
    isAll,
  );

  const { data: citiesResponse, isLoading: isLoadingCities } = usePlaceCategories(
    { pageSize: 100, group: 'cities' },
    isAll,
  );
  const cities: PlaceCategory[] = (citiesResponse?.data?.results ?? [])
    .filter((category: PlaceCategory) => category.group === 'cities')
    .sort((a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount);

  // Curated destination row: no featured-destination field exists, so use the
  // top city by count; experiences have no city filter, so search by city name
  const topCity = cities[0];
  const { data: topCityResponse, isLoading: isLoadingTopCity } = useExperiences(
    { page: 1, page_size: 8, search: topCity?.name },
    isAll && Boolean(topCity),
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    router.replace(value === 'all' ? '/experiences' : `/experiences?category=${value}`, {
      scroll: false,
    });
  };

  const visibleTabs = session?.user ? TABS : TABS.filter((tab) => tab.value === 'all');

  return (
    <main className="grid grid-cols-12 gap-x-4 px-4 md:px-0">
      {/* Filter tabs */}
      <div className="col-span-12 pt-6 md:col-span-10 md:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="h-auto gap-0 rounded-full bg-gray-100 p-1">
            {visibleTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-full border-0 px-5 py-2 text-sm font-normal text-gray-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:font-normal data-[state=active]:border-b-0"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isAll ? (
        <div className="col-span-12 space-y-10 py-6 md:col-span-10 md:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
            {/* Featured Experience */}
            {isLoadingDiscover ? (
              <div className="aspect-[16/9] w-full animate-pulse rounded-2xl bg-gray-200 md:aspect-[3/1]" />
            ) : (
              featuredExperience && <FeaturedExperienceBanner experience={featuredExperience} />
            )}

            <ExperienceRow
              title="Happening Near You"
              subtitle={`Within 25 km of ${userCity}`}
              seeAllHref="/experiences?near=me"
              experiences={nearbyExperiences}
              isLoading={isLoadingDiscover}
            />

            {/* Experiences by City */}
            {(isLoadingCities || cities.length > 0) && (
              <section>
                <SectionHeader
                  title="Experiences by City"
                  subtitle="Browse by destination"
                  seeAllHref="/places"
                />
                {isLoadingCities ? (
                  <RowSkeleton cardWidth={240} cardHeight={130} />
                ) : (
                  <CardRow>
                    {cities.map((category) => (
                      <CarouselItem key={category.id} className="basis-auto">
                        <CityCard
                          city={category.name}
                          experienceCount={category.placesCount}
                          imageUrl={category.image ?? ''}
                          href={`/places?city=${category.id}`}
                        />
                      </CarouselItem>
                    ))}
                  </CardRow>
                )}
              </section>
            )}

            <ExperienceRow
              title="Happening Today"
              subtitle={formatLongDateWithOrdinal(new Date())}
              seeAllHref="/experiences?date=today"
              experiences={todayResponse?.data?.results ?? []}
              isLoading={isLoadingToday}
            />

            <ExperienceRow
              title={`Happening Tomorrow in ${userCity}`}
              subtitle={formatLongDateWithOrdinal(moment().add(1, 'days').toDate())}
              seeAllHref="/experiences?date=tomorrow"
              experiences={tomorrowResponse?.data?.results ?? []}
              isLoading={isLoadingTomorrow}
            />

          {topCity && (
            <ExperienceRow
              title={`Experiences in ${topCity.name}`}
              subtitle="Curated destination"
              seeAllHref={`/places?city=${topCity.id}`}
              experiences={topCityResponse?.data?.results ?? []}
              isLoading={isLoadingTopCity}
            />
          )}
        </div>
      ) : (
        /* Reserved / Saved / Hosting — existing grid lists with empty states.
           The Experiences wrapper positions itself inside this 12-col grid. */
        <>
          {activeTab === 'saved' && (
            <Experiences
              key={activeTab}
              category={activeTab}
              isPortal={false}
              isBookedmarked={true}
              isReserved={false}
              isHosted={false}
              noDataMessage="You have no bookmarked experiences"
            />
          )}
          {activeTab === 'hosting' && (
            <Experiences
              key={activeTab}
              category={activeTab}
              isPortal={false}
              isBookedmarked={false}
              isReserved={false}
              isHosted={true}
              noDataMessage="You are not hosting any experiences"
            />
          )}
          {activeTab === 'reserved' && (
            <Experiences
              key={activeTab}
              category={activeTab}
              isPortal={false}
              isBookedmarked={false}
              isReserved={true}
              isHosted={false}
              noDataMessage="You have no reserved experiences"
            />
          )}
        </>
      )}
    </main>
  );
};
