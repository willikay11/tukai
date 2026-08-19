'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import moment from 'moment';

import { BucketListCard } from '@/app/(experiences)/experiences/components/BucketListCard';
import { CityCard } from '@/app/(experiences)/experiences/components/CityCard';
import { CreateBucketListModal } from '@/app/(experiences)/experiences/components/CreateBucketListModal';
import { FeaturedExperienceBanner } from '@/app/(experiences)/experiences/components/FeaturedExperienceBanner';
import { HostingCard } from '@/app/(experiences)/experiences/components/HostingCard';
import { Experiences } from '@/app/(experiences)/experiences/components/List/experiences';
import { ReservationCard } from '@/app/(experiences)/experiences/components/ReservationCard';
import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { SharedBucketListCard } from '@/app/(experiences)/experiences/components/SharedBucketListCard';
import { SingleExperience } from '@/app/shared/components/Experiences/Single';
import { IconComponent } from '@/app/shared/components/Icons';
import { useMyBucketLists, useSharedBucketLists } from '@/app/shared/hooks/useBucketLists';
import { useExperiences, useTicketPurchases } from '@/app/shared/hooks/useExperiences';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { toast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation } from '@/context/LocationContext';
import { downloadTicketPdf } from '@/services/experience';
import { BucketList } from '@/types/bucket-list';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import { PlaceCategory } from '@/types/placeCategory';
import { Reservation } from '@/types/ticket-purchase';
import { formatLongDateWithOrdinal } from '@/utils/date-utils';
import { groupTicketPurchases } from '@/utils/ticket-utils';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'saved', label: 'Saved' },
  { value: 'hosting', label: 'Hosting' },
];

// Native horizontal scroller — unlike the embla carousel it responds to
// trackpad/wheel scrolling and keyboard as well as touch drag
const ScrollRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 scrollbar-hide">
    {children}
  </div>
);

const RowSkeleton = ({
  cardWidth = 280,
  cardHeight,
}: {
  cardWidth?: number;
  cardHeight?: number;
}) => (
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
        <ScrollRow>
          {experiences.map((experience) => (
            <div key={experience.id} className="w-[280px] flex-shrink-0 snap-start">
              <Link target="_blank" href={`/experiences/${experience.id}`}>
                <SingleExperience type="discover" variant="row" experience={experience} />
              </Link>
            </div>
          ))}
        </ScrollRow>
      )}
    </section>
  );
};

export const ExperiencesPageContent = ({ initialCategory }: { initialCategory: string }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { city, lat, lng } = useLocation();
  const [activeTab, setActiveTab] = useState(
    TABS.some((tab) => tab.value === initialCategory) ? initialCategory : 'all',
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isAll = activeTab === 'all';
  const isSaved = activeTab === 'saved';
  const isReserved = activeTab === 'reserved';
  const userId = session?.user?.id;

  // ⚠️ Bucket lists are served by a MOCK service — no backend endpoints exist yet
  const { data: myBucketListsResponse, isLoading: isLoadingMine } = useMyBucketLists(isSaved);
  const { data: sharedBucketListsResponse } = useSharedBucketLists(isSaved);
  const myBucketLists: BucketList[] = myBucketListsResponse?.data?.results ?? [];
  const sharedBucketLists: BucketList[] = sharedBucketListsResponse?.data?.results ?? [];

  // Reservations: one purchase record per ticket, grouped into cards; the
  // purchase only carries the experience uuid, so join against the user's
  // reserved experiences for title / cover / community
  const { data: purchasesResponse, isLoading: isLoadingPurchases } = useTicketPurchases(
    userId,
    isReserved,
  );
  const { data: reservedExperiencesResponse, isLoading: isLoadingReservedExperiences } =
    useExperiences(
      { page: 1, page_size: 100, reserved_by: isReserved ? userId : undefined },
      isReserved && Boolean(userId),
    );
  const reservations: Reservation[] = groupTicketPurchases(purchasesResponse?.data?.results ?? []);
  const reservedExperiences: Experience[] = reservedExperiencesResponse?.data?.results ?? [];
  const isLoadingReservations = isLoadingPurchases || isLoadingReservedExperiences;

  // Hosting: everything the user created, across all statuses
  const isHosting = activeTab === 'hosting';
  const { data: hostedResponse, isLoading: isLoadingHosted } = useExperiences(
    { page: 1, page_size: 100, hosted_by: isHosting ? userId : undefined },
    isHosting && Boolean(userId),
  );
  const hostedExperiences: Experience[] = hostedResponse?.data?.results ?? [];

  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  // Per-ticket PDFs only — no bulk endpoint, so download each in sequence
  const handleDownloadAll = async (reservation: Reservation) => {
    setDownloadingKey(reservation.key);
    try {
      for (const ticket of reservation.tickets.filter((item) => item.hasPdf)) {
        const blob = await downloadTicketPdf(ticket.id);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${ticket.ticketNumber}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Could not download your tickets. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingKey(null);
    }
  };
  const userCity = city ?? 'Nairobi';
  const today = moment().format('YYYY-MM-DD');
  const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');

  // No featured endpoint exists — the default list is the closest available
  // query, and its first result stands in as the featured hero
  const { data: discoverResponse, isLoading: isLoadingDiscover } = useExperiences(
    { page: 1, page_size: 9 },
    isAll,
  );
  const discoverExperiences: Experience[] = discoverResponse?.data?.results ?? [];
  const featuredExperience = discoverExperiences[0];

  // "Happening Near You": the first 10 published experiences, scoped to the
  // coordinates the LocationContext resolved. Coordinates are omitted until the
  // user grants location, so the row still renders (unscoped) if they decline.
  const { data: nearbyResponse, isLoading: isLoadingNearby } = useExperiences(
    { page: 1, page_size: 10, status: 'published', lat, long: lng },
    isAll,
  );
  const nearbyExperiences: Experience[] = nearbyResponse?.data?.results ?? [];

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
  const visibleCities = cities.slice(0, 10);
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
                className="rounded-full border-0 px-5 py-2 text-sm font-normal text-gray-500 data-[state=active]:border-b-0 data-[state=active]:bg-white data-[state=active]:font-normal data-[state=active]:text-primary"
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
            isLoading={isLoadingNearby}
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
                <ScrollRow>
                  {visibleCities.map((category) => (
                    <div key={category.id} className="snap-start">
                      <CityCard
                        city={category.name}
                        experienceCount={category.placesCount}
                        imageUrl={category.image ?? ''}
                        href={`/places?city=${category.id}`}
                      />
                    </div>
                  ))}
                </ScrollRow>
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
        /* Reserved / Saved / Hosting — the Experiences wrapper positions
           itself inside this 12-col grid; the Saved tab has its own layout. */
        <>
          {activeTab === 'saved' && (
            <div className="col-span-12 space-y-10 py-6 md:col-span-10 md:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
              {/* Your Bucket Lists */}
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Your Bucket Lists</h2>
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex items-center gap-2 rounded-full px-6"
                  >
                    <IconComponent iconName="PlusSignIcon" size={16} color="white" />
                    Create Bucket List
                  </Button>
                </div>

                {isLoadingMine ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[300px] animate-pulse rounded-2xl bg-gray-200"
                      />
                    ))}
                  </div>
                ) : myBucketLists.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <NoData message="You haven't created any bucket lists yet" />
                    <Button onClick={() => setIsCreateOpen(true)} className="rounded-full px-6">
                      Create your first bucket list
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {myBucketLists.map((bucketList) => (
                      <BucketListCard
                        key={bucketList.id}
                        bucketList={bucketList}
                        onClick={() => router.push(`/bucket-lists/${bucketList.id}`)}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Shared with you — hidden entirely when empty */}
              {sharedBucketLists.length > 0 && (
                <section>
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">Shared with you</h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sharedBucketLists.map((bucketList) => (
                      <SharedBucketListCard key={bucketList.id} bucketList={bucketList} />
                    ))}
                  </div>
                </section>
              )}

              <CreateBucketListModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
            </div>
          )}
          {activeTab === 'hosting' && (
            <div className="col-span-12 py-6 md:col-span-10 md:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
              <SectionHeader
                title="Hosting"
                subtitle="Every experience you host, in all statuses"
              />

              {isLoadingHosted ? (
                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-[300px] animate-pulse rounded-2xl bg-gray-200" />
                  ))}
                </div>
              ) : hostedExperiences.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <NoData message="You're not hosting any experiences yet" />
                  <Button
                    onClick={() => router.push('/experiences/create')}
                    className="rounded-full px-6"
                  >
                    Create an experience
                  </Button>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {hostedExperiences.map((hostedExperience) => (
                    <HostingCard key={hostedExperience.id} experience={hostedExperience} />
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'reserved' && (
            <div className="col-span-12 py-6 md:col-span-10 md:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
              <SectionHeader
                title="Reserved Experiences"
                subtitle="Your upcoming adventures, tickets in hand"
              />

              {isLoadingReservations ? (
                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div key={index} className="h-[340px] animate-pulse rounded-2xl bg-gray-200" />
                  ))}
                </div>
              ) : reservations.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-8">
                  <NoData message="You have no reserved experiences yet" />
                  <Button onClick={() => handleTabChange('all')} className="rounded-full px-6">
                    Explore experiences
                  </Button>
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {reservations.map((reservation) => {
                    const experience = reservedExperiences.find(
                      (item) => item.id === reservation.experienceId,
                    );
                    const coverPhoto =
                      experience?.photos?.find((photo: Photo) => photo.isCover)?.photo ||
                      experience?.photos?.[0]?.photo ||
                      null;

                    return (
                      <Link
                        key={reservation.key}
                        target="_blank"
                        href={`/experiences/${reservation.experienceId}`}
                      >
                        <ReservationCard
                          title={experience?.title ?? reservation.ticketName}
                          coverPhoto={coverPhoto}
                          occurrenceStart={reservation.occurrenceStart}
                          occurrenceEnd={reservation.occurrenceEnd}
                          communityName={experience?.hostCommunity?.title ?? null}
                          ticketCount={reservation.ticketCount}
                          status={reservation.status}
                          tickets={reservation.tickets}
                          shareLink={`${process.env.NEXT_PUBLIC_APP_URL}/experiences/${reservation.experienceId}`}
                          onDownloadAll={() => handleDownloadAll(reservation)}
                          isDownloading={downloadingKey === reservation.key}
                        />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
};
