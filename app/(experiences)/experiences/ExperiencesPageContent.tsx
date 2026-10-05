'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import moment from 'moment';

import { ExperienceCard } from '@/app/(experiences)/components/ExperienceCard';
import { ItineraryCard } from '@/app/(experiences)/components/ItineraryCard';
import { BucketListCard } from '@/app/(experiences)/experiences/components/BucketListCard';
import { CategoryChipRow } from '@/app/(experiences)/experiences/components/CategoryChipRow';
import type { CategoryChip } from '@/app/(experiences)/experiences/components/CategoryChipRow';
import { CitiesRail } from '@/app/(experiences)/experiences/components/CitiesRail';
import { CommunitiesSection } from '@/app/(experiences)/experiences/components/CommunitiesSection';
import { CreateBucketListModal } from '@/app/(experiences)/experiences/components/CreateBucketListModal';
import {
  DISCOVER_GRID_PAGE_SIZE,
  DiscoverGrid,
} from '@/app/(experiences)/experiences/components/DiscoverGrid';
import {
  ExperienceRow,
  RowSkeleton,
} from '@/app/(experiences)/experiences/components/ExperienceRow';
import {
  GUIDED_TOURS_PAGE_SIZE,
  GuidedToursRail,
} from '@/app/(experiences)/experiences/components/GuidedToursRail';
import { HappeningNearYou } from '@/app/(experiences)/experiences/components/HappeningNearYou';
import { HostingCard } from '@/app/(experiences)/experiences/components/HostingCard';
import { ReservedTab } from '@/app/(experiences)/experiences/components/ReservedTab';
import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import {
  FEATURED_PAGE_SIZE,
  featuredOnly,
} from '@/app/(experiences)/experiences/components/featured-experiences';
import {
  cityExperiencesHref,
  shouldShowSeeAll,
} from '@/app/(experiences)/experiences/see-all/config';
import { IconComponent } from '@/app/shared/components/Icons';
import { CardRail, SeeAllCard } from '@/app/shared/components/Lists';
import { PillTabs } from '@/app/shared/components/Tabs';
import { isSharedWithMe, useMyBucketLists } from '@/app/shared/hooks/useBucketLists';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { useExperiences, useTicketPurchases } from '@/app/shared/hooks/useExperiences';
import { usePlaceCategories } from '@/app/shared/hooks/usePlaces';
import { toast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { useLocation } from '@/context/LocationContext';
import { downloadTicketPdf } from '@/services/experience';
import { BucketList } from '@/types/bucket-list';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { PlaceCategory } from '@/types/placeCategory';
import { Reservation } from '@/types/ticket-purchase';
import { formatLongDateWithOrdinal } from '@/utils/date-utils';
import { groupTicketPurchases } from '@/utils/ticket-utils';

// Saved and Hosting are no longer surfaced. Their components and render
// branches below are intentionally left in place - only the tabs are gone, so
// nothing routes to them.
const TABS = [
  { value: 'all', label: 'All' },
  { value: 'reserved', label: 'Reserved' },
];

/** Cards in a horizontal row that are fetched straight away rather than lazily. */
const EAGER_IN_ROW = 3;

/** Itineraries the Discover itineraries rail asks for. */
const ITINERARY_PAGE_SIZE = 8;

/** The place-category group the experience category chips are read from. */
const CATEGORY_CHIP_GROUP = 'interests';
const ALL_CATEGORIES = 'all';

export const ExperiencesPageContent = ({ initialCategory }: { initialCategory: string }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { city, lat, lng, setCity } = useLocation();
  const [activeTab, setActiveTab] = useState(
    TABS.some((tab) => tab.value === initialCategory) ? initialCategory : 'all',
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // 'all' is no filter. Kept out of the URL: `category` there already names the tab.
  const [categoryId, setCategoryId] = useState(ALL_CATEGORIES);
  const categoryFilter = categoryId === ALL_CATEGORIES ? undefined : categoryId;
  const [discoverPage, setDiscoverPage] = useState(1);

  const isAll = activeTab === 'all';
  const isSaved = activeTab === 'saved';
  const isReserved = activeTab === 'reserved';
  const userId = session?.user?.id;

  // ⚠️ Bucket lists are served by a MOCK service - no backend endpoints exist yet
  // One endpoint returns both the lists the reader owns and the ones they were
  // invited onto; the owner is what tells them apart
  const { data: bucketListsResponse, isLoading: isLoadingMine } = useMyBucketLists(isSaved);
  const allBucketLists: BucketList[] = bucketListsResponse?.data?.results ?? [];
  const myBucketLists = allBucketLists.filter((list) => !isSharedWithMe(list, session?.user?.id));
  const sharedBucketLists = allBucketLists.filter((list) =>
    isSharedWithMe(list, session?.user?.id),
  );

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

  // "N invites waiting" - experiences the user was invited to. Same query
  // InvitedExperiences uses; the count is the API total, not the page length.
  const { data: invitedResponse } = useExperiences(
    { page: 1, page_size: 50, invited: isReserved ? true : undefined },
    isReserved && Boolean(userId),
  );
  const invites: Experience[] = invitedResponse?.data?.results ?? [];
  const isLoadingReservations = isLoadingPurchases || isLoadingReservedExperiences;

  // Hosting: everything the user created, across all statuses
  const isHosting = activeTab === 'hosting';
  const { data: hostedResponse, isLoading: isLoadingHosted } = useExperiences(
    { page: 1, page_size: 100, hosted_by: isHosting ? userId : undefined },
    isHosting && Boolean(userId),
  );
  const hostedExperiences: Experience[] = hostedResponse?.data?.results ?? [];

  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  // Per-ticket PDFs only - no bulk endpoint, so download each in sequence
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

  // The list serializer carries `featured`, but there is no query param for it,
  // so one page is read and filtered here (as Promoted places is)
  const { data: featuredResponse, isLoading: isLoadingFeatured } = useExperiences(
    { page: 1, page_size: FEATURED_PAGE_SIZE, status: 'published', category: categoryFilter },
    isAll,
  );
  const featuredExperiences: Experience[] = featuredOnly(featuredResponse?.data?.results ?? []);

  // "Happening near you": the first 10 published experiences, scoped to the
  // coordinates the LocationContext resolved. Coordinates are omitted until the
  // user grants location, so the row still renders (unscoped) if they decline.
  const { data: nearbyResponse, isLoading: isLoadingNearby } = useExperiences(
    {
      page: 1,
      page_size: 10,
      status: 'published',
      lat,
      long: lng,
      category: categoryFilter,
    },
    isAll,
  );
  const nearbyExperiences: Experience[] = nearbyResponse?.data?.results ?? [];
  const nearbyTotal = nearbyResponse?.data?.count ?? 0;
  const hasMoreNearby = nearbyTotal > nearbyExperiences.length;

  // The full list is only read once the reader expands the row, so the page
  // does not pay for every match up front
  const [isNearbyExpanded, setIsNearbyExpanded] = useState(false);
  const { data: nearbyAllResponse, isLoading: isLoadingNearbyAll } = useExperiences(
    {
      page: 1,
      page_size: nearbyTotal,
      status: 'published',
      lat,
      long: lng,
      category: categoryFilter,
    },
    isAll && isNearbyExpanded && hasMoreNearby,
  );
  const allNearbyExperiences: Experience[] = nearbyAllResponse?.data?.results ?? [];
  // Until the full list lands, the first page stays on screen rather than a blank grid
  const shownNearbyExperiences =
    isNearbyExpanded && allNearbyExperiences.length > 0 ? allNearbyExperiences : nearbyExperiences;

  const { data: todayResponse, isLoading: isLoadingToday } = useExperiences(
    { page: 1, page_size: 8, date: today, category: categoryFilter },
    isAll,
  );
  const todayCount = todayResponse?.data?.count;
  const { data: tomorrowResponse, isLoading: isLoadingTomorrow } = useExperiences(
    { page: 1, page_size: 8, date: tomorrow, category: categoryFilter },
    isAll,
  );
  const tomorrowCount = tomorrowResponse?.data?.count;

  const { data: citiesResponse, isLoading: isLoadingCities } = usePlaceCategories(
    { pageSize: 100, group: 'cities' },
    isAll,
  );
  // The chips. Interest-group place categories stand in for the experience
  // categories until the API exposes its own list (see EL-01).
  const { data: interestsResponse } = usePlaceCategories(
    { pageSize: 100, group: CATEGORY_CHIP_GROUP },
    isAll,
  );
  const categoryChips: CategoryChip[] = [
    { value: ALL_CATEGORIES, label: 'All' },
    ...(interestsResponse?.data?.results ?? []).map((category: PlaceCategory) => ({
      value: category.id,
      label: category.name,
    })),
  ];

  const cities: PlaceCategory[] = (citiesResponse?.data?.results ?? [])
    .filter((category: PlaceCategory) => category.group === 'cities')
    .sort((a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount);

  // Curated destination row: no featured-destination field exists, so use the
  // top city by count; experiences have no city filter, so search by city name
  const topCity = cities[0];

  // Discover itineraries: published itinerary-type experiences. The rail is
  // hidden when there are none, so no empty heading shows.
  const { data: itinerariesResponse, isLoading: isLoadingItineraries } = useExperiences(
    { page: 1, page_size: ITINERARY_PAGE_SIZE, status: 'published', experience_type: 'itinerary' },
    isAll,
  );
  const itineraries: Experience[] = itinerariesResponse?.data?.results ?? [];
  const itineraryTotal = itinerariesResponse?.data?.count ?? 0;

  // Communities running what is on: the list is filtered to those with an
  // upcoming experience. Hidden when empty or when the request fails.
  const { data: communitiesResponse, isLoading: isLoadingCommunities } = useGetCommunities({
    page: 1,
    enabled: isAll,
    showUpComingExperiences: true,
  });
  const communities: Community[] = communitiesResponse?.data?.results ?? [];
  const communityTotal = communitiesResponse?.data?.count ?? 0;

  // Guided tours: the same query Discover's tours rail issues. The rail is
  // hidden when there are none, so no empty heading shows.
  const { data: toursResponse, isLoading: isLoadingTours } = useExperiences(
    {
      page: 1,
      page_size: GUIDED_TOURS_PAGE_SIZE,
      experience_type: 'guide_booking',
      lat,
      long: lng,
      category: categoryFilter,
    },
    isAll,
  );
  const tours: Experience[] = toursResponse?.data?.results ?? [];
  const tourTotal = toursResponse?.data?.count ?? tours.length;

  // Discover experiences: every published experience, one page at a time. Not
  // scoped to the location, so the count is the whole published total.
  const { data: discoverResponse, isLoading: isLoadingDiscover } = useExperiences(
    {
      page: discoverPage,
      page_size: DISCOVER_GRID_PAGE_SIZE,
      status: 'published',
      category: categoryFilter,
    },
    isAll,
  );
  const discoverExperiences: Experience[] = discoverResponse?.data?.results ?? [];
  const discoverTotal = discoverResponse?.data?.count ?? 0;

  // A different category is a different list, so paging starts again at the top
  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setDiscoverPage(1);
  };

  const { data: topCityResponse, isLoading: isLoadingTopCity } = useExperiences(
    { page: 1, page_size: 8, search: topCity?.name, category: categoryFilter },
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
        <PillTabs tabs={visibleTabs} value={activeTab} onChange={handleTabChange} />
      </div>

      {isAll ? (
        <div className="col-span-12 space-y-10 py-6 md:col-span-10 md:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
          {/* Category filter: narrows the experience rails below. Hidden until
              there is more than the All chip, so no lone chip shows. */}
          {categoryChips.length > 1 && (
            <CategoryChipRow
              chips={categoryChips}
              value={categoryId}
              onChange={handleCategoryChange}
            />
          )}

          {/* Featured experiences: a paged rail of cards, as the design has it.
              Hidden when nothing is featured, so no empty heading shows. */}
          {(isLoadingFeatured || featuredExperiences.length > 0) && (
            <CardRail title="Featured experiences" subtitle="Handpicked from what is coming up">
              {isLoadingFeatured ? (
                <RowSkeleton cardClassName="aspect-[4/3] w-[280px]" />
              ) : (
                featuredExperiences.map((experience, index) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    priority={index < EAGER_IN_ROW}
                  />
                ))
              )}
            </CardRail>
          )}

          <HappeningNearYou
            experiences={shownNearbyExperiences}
            total={nearbyTotal}
            hasMore={hasMoreNearby}
            isLoading={isLoadingNearby || (isNearbyExpanded && isLoadingNearbyAll)}
            isExpanded={isNearbyExpanded}
            onToggle={() => setIsNearbyExpanded((current) => !current)}
          />

          <CitiesRail
            cities={cities}
            isLoading={isLoadingCities}
            selectedCity={city}
            onSelectCity={setCity}
          />

          <ExperienceRow
            title={`Happening today ${formatLongDateWithOrdinal(new Date())}`}
            subtitle={
              todayCount === undefined
                ? undefined
                : `${todayCount} ${todayCount === 1 ? 'experience' : 'experiences'}`
            }
            seeAllHref="/experiences/see-all?type=today"
            total={todayCount}
            experiences={todayResponse?.data?.results ?? []}
            isLoading={isLoadingToday}
          />

          <ExperienceRow
            title={`Happening tomorrow ${formatLongDateWithOrdinal(moment().add(1, 'days').toDate())}`}
            subtitle={
              tomorrowCount === undefined
                ? undefined
                : `${tomorrowCount} ${tomorrowCount === 1 ? 'experience' : 'experiences'}`
            }
            seeAllHref={`/experiences/see-all?type=tomorrow&city=${encodeURIComponent(userCity)}`}
            total={tomorrowCount}
            experiences={tomorrowResponse?.data?.results ?? []}
            isLoading={isLoadingTomorrow}
          />

          {(isLoadingItineraries || itineraries.length > 0) && (
            <CardRail title="Discover itineraries" subtitle="Several places in one plan">
              {isLoadingItineraries ? (
                <RowSkeleton cardClassName="aspect-square w-[184px]" />
              ) : (
                <>
                  {itineraries.map((itinerary) => (
                    <ItineraryCard key={itinerary.id} itinerary={itinerary} />
                  ))}

                  {/* Only when the API holds more than the row shows: a full
                      row that is every itinerary there is would lead nowhere new */}
                  {shouldShowSeeAll(itineraryTotal) && (
                    <SeeAllCard
                      href="/experiences/see-all?type=itineraries"
                      previewPhotos={itineraries
                        .slice(0, 3)
                        .map((itinerary) => coverPhotoUrl(itinerary.photos, 'md'))}
                    />
                  )}
                </>
              )}
            </CardRail>
          )}

          <CommunitiesSection
            communities={communities}
            total={communityTotal}
            isLoading={isLoadingCommunities}
          />

          <GuidedToursRail
            tours={tours}
            total={tourTotal}
            isLoading={isLoadingTours}
            hasLocation={lat !== undefined && lng !== undefined}
          />

          <DiscoverGrid
            experiences={discoverExperiences}
            total={discoverTotal}
            page={discoverPage}
            onPageChange={setDiscoverPage}
            isLoading={isLoadingDiscover}
          />

          {topCity && (
            <ExperienceRow
              title={`Experiences in ${topCity.name}`}
              subtitle="Curated destination"
              seeAllHref={cityExperiencesHref(topCity.name)}
              total={topCityResponse?.data?.count}
              experiences={topCityResponse?.data?.results ?? []}
              isLoading={isLoadingTopCity}
            />
          )}
        </div>
      ) : (
        /* Reserved / Saved / Hosting - the Experiences wrapper positions
           itself inside this 12-col grid; the Saved tab has its own layout. */
        <>
          {activeTab === 'saved' && (
            <div className="col-span-12 space-y-10 py-6 md:col-span-10 md:col-start-2 3xl:col-span-8 3xl:col-start-3 4xl:col-span-6 4xl:col-start-4">
              {/* Your Bucket Lists */}
              <section>
                {/* Wraps rather than squeezing the button against the heading
                    on a narrow screen */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Your Bucket Lists</h2>
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="flex flex-shrink-0 items-center gap-2 rounded-full px-6"
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
                        href={`/bucket-lists/${bucketList.id}`}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Shared with you - hidden entirely when empty */}
              {sharedBucketLists.length > 0 && (
                <section>
                  <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">
                    Shared with you
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sharedBucketLists.map((bucketList) => (
                      <BucketListCard
                        key={bucketList.id}
                        bucketList={bucketList}
                        href={`/bucket-lists/${bucketList.id}`}
                      />
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
              <ReservedTab
                reservations={reservations}
                reservedExperiences={reservedExperiences}
                invites={invites}
                isLoading={isLoadingReservations}
                downloadingKey={downloadingKey}
                onDownloadAll={handleDownloadAll}
                onExplore={() => handleTabChange('all')}
              />
            </div>
          )}
        </>
      )}
    </main>
  );
};
