'use client';

import { useState } from 'react';

import { useSearchParams } from 'next/navigation';

import { BucketListRow } from '@/app/(experiences)/components/BucketListRow';
import { CommunityRow } from '@/app/(experiences)/components/CommunityRow';
import { ExperienceCard } from '@/app/(experiences)/components/ExperienceCard';
import { hasMoreSoon, happeningSoon } from '@/app/(experiences)/components/ExperienceCard/happening-soon';
import { ROW_GRID, RowGridSkeleton } from '@/app/(experiences)/components/MediaRow';
import { MomentComposeCard } from '@/app/(experiences)/components/MomentCard/MomentComposeCard';
import { PlaceCard } from '@/app/(experiences)/components/PlaceCard';
import { SearchResults } from '@/app/(experiences)/components/SearchResults';
import { filtersFromParams, hasSearch } from '@/app/(experiences)/components/SearchResults/filters';
import { CityCard } from '@/app/(experiences)/experiences/components/CityCard';
import { RowSkeleton } from '@/app/(experiences)/experiences/components/ExperienceRow';
import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { DEFAULT_CITY, cityExperiencesHref } from '@/app/(experiences)/experiences/see-all/config';
import { PageContainer } from '@/app/shared/components/Layout';
import { CardGrid, CardRail, SeeAllCard } from '@/app/shared/components/Lists';
import { ShowMoreButton } from '@/app/shared/components/Lists';
import { MomentCard, MomentComposer, MomentDrawer } from '@/app/shared/components/Moments';
import { usePublicBucketLists } from '@/app/shared/hooks/useBucketLists';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useMoments } from '@/app/shared/hooks/useMoments';
import {
  useFeaturedPlaces,
  usePlaceCategories,
  usePlacesWithExperiences,
} from '@/app/shared/hooks/usePlaces';
import { useLocation } from '@/context/LocationContext';
import { BucketList } from '@/types/bucket-list';
import { Community } from '@/types/community';
import { Experience } from '@/types/experience';
import { Moment, momentPhotos } from '@/types/moment';
import { Photo } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceCategory, categoryImageOf } from '@/types/placeCategory';

const ROW_SIZE = 10;

/**
 * How many experiences the "Happening soon" rail reads before narrowing to the
 * next fortnight. Wider than the nine it shows, because the API cannot be
 * asked for a date range and sorts by distance, not by date.
 */
const SOON_PAGE_SIZE = 50;

/** The canvas fills the "Places with experiences" grid five at a time. */
const PLACES_PER_PAGE = 5;

const MOMENTS_SUBTITLE = 'Proof it happened, shared by the people who were there';

/** Four across, two rows - what the list sections show before "View more". */
const ROW_GRID_SIZE = 8;

/** Read in one go; "View more" pages through it without another request. */
const PUBLIC_LISTS_SIZE = 24;

/**
 * Public lists sit two across from phone width, so a reader sees more of them
 * without scrolling. The shared row grid is one column on a phone.
 */
const PUBLIC_LISTS_GRID = 'grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-8 xl:grid-cols-4';

/** Read in one go, then paged locally - the API pages by request. */
const PLACES_WITH_EXPERIENCES_SIZE = 30;

// First photo of a row's leading item, used as the See All tile's preview
const coverPhotoOf = (experience: Experience | undefined): string | null =>
  experience?.photos?.find((photo: Photo) => photo.isCover)?.photo ||
  experience?.photos?.[0]?.photo ||
  null;

/**
 * How many cards in a horizontal row are fetched eagerly.
 *
 * A scroll row shows about three at once on a laptop and two on a phone;
 * anything past that is off-screen and stays lazy. Marking them `priority`
 * skips the lazy-load observer, which cannot fire until React has painted -
 * the reason the first row used to trickle in a card at a time.
 */
const EAGER_IN_ROW = 3;

export const DiscoverPageContent = () => {
  const searchParams = useSearchParams();
  const { city, lat, lng } = useLocation();

  // A search or a filter replaces the rails outright, as the canvas has it -
  // and it lives in the URL, so a result list is somewhere you can send
  // someone and the back button still means something
  const filters = filtersFromParams(searchParams);
  const isSearching = hasSearch(filters);

  // Discover has no place, experience or community of its own to post a
  // moment at, so the composer opens untagged - see MomentComposer
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [openMoment, setOpenMoment] = useState<Moment | null>(null);

  // "View more" reveals another grid's worth in place rather than navigating -
  // there is no public-lists page to send anyone to
  const [visibleListCount, setVisibleListCount] = useState(ROW_GRID_SIZE);

  const { data: promotedResponse, isLoading: isLoadingPromoted } = useFeaturedPlaces(!isSearching);
  const promotedPlaces: Place[] = promotedResponse?.data?.results ?? [];

  const { data: withExperiencesResponse, isLoading: isLoadingWithExperiences } =
    usePlacesWithExperiences(!isSearching, PLACES_WITH_EXPERIENCES_SIZE);
  const placesWithExperiences: Place[] = withExperiencesResponse?.data?.results ?? [];

  // A tour is an experience the API provisions behind a guide's profile, so
  // this is the whole query - see the section below
  const { data: toursResponse, isLoading: isLoadingTours } = useExperiences(
    { page: 1, page_size: ROW_SIZE, experience_type: 'guide_booking', lat, long: lng },
    !isSearching,
  );
  const guidedTours: Experience[] = toursResponse?.data?.results ?? [];
  const tourCount: number = toursResponse?.data?.count ?? guidedTours.length;
  // Nothing for See all to lead to once the rail holds them all
  const hasMoreTours = tourCount > guidedTours.length;

  // ⚠️ `GET /experiences/` takes a single `date`, not a range, so "next 14
  // days" cannot be asked for - a wider page is read and narrowed by
  // happeningSoon(). Coordinates are omitted until the user grants location,
  // so the rail still renders unscoped if they decline.
  const { data: rowResponse, isLoading: isLoadingRow } = useExperiences(
    { page: 1, page_size: SOON_PAGE_SIZE, status: 'published', lat, long: lng },
    true,
  );
  const soonResults: Experience[] = rowResponse?.data?.results ?? [];
  const soonExperiences: Experience[] = happeningSoon(soonResults);
  // See all only when the fortnight holds more than the rail shows
  const hasMoreSoonExperiences = hasMoreSoon(soonResults);

  const { data: citiesResponse, isLoading: isLoadingCities } = usePlaceCategories(
    { pageSize: 100, group: 'cities' },
    true,
  );
  const allCities: PlaceCategory[] = (citiesResponse?.data?.results ?? [])
    .filter((category: PlaceCategory) => category.group === 'cities')
    .sort((a: PlaceCategory, b: PlaceCategory) => b.placesCount - a.placesCount);
  const cities: PlaceCategory[] = allCities.slice(0, ROW_SIZE);

  // `upcoming_experiences` is the section's own heading as a filter: a
  // community organising things is one with something coming up
  const { data: organisingResponse, isLoading: isLoadingOrganising } = useGetCommunities({
    page: 1,
    enabled: !isSearching,
    showUpComingExperiences: true,
  });
  const organisingCommunities: Community[] = (organisingResponse?.data?.results ?? []).slice(
    0,
    ROW_GRID_SIZE,
  );

  const { data: publicListsResponse, isLoading: isLoadingPublicLists } = usePublicBucketLists(
    !isSearching,
    PUBLIC_LISTS_SIZE,
  );
  const publicLists: BucketList[] = publicListsResponse?.data?.results ?? [];
  const shownPublicLists = publicLists.slice(0, visibleListCount);

  const { data: momentsResponse, isLoading: isLoadingMoments } = useMoments({
    page: 1,
    page_size: ROW_SIZE,
  });
  // This row is photo-led. Media whose photo is null (a video, or an upload
  // still processing) cannot be rendered and would throw in next/image.
  const moments: Moment[] = (momentsResponse?.data?.results ?? []).filter(
    (moment: Moment) => momentPhotos(moment).length > 0,
  );

  // Same queries the /experiences rows issue
  const userCity = city ?? DEFAULT_CITY;

  // ⚠️ `count` is the whole published total, not a per-city one: the list is
  // geo-ORDERED by lat/long, never geo-filtered, so saying "in {city}" is a
  // claim the API cannot make. The number is dropped where it would be wrong.
  const toursSubtitle =
    lat !== undefined && lng !== undefined
      ? `${tourCount} ${tourCount === 1 ? 'tour' : 'tours'} led by local guides near you`
      : `Tours led by local guides, closest to ${userCity} first`;

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
          featured - see useFeaturedPlaces. */}
      {(isLoadingPromoted || promotedPlaces.length > 0) && (
        <CardRail title="Promoted places" subtitle="Handpicked by the communities that run them">
          {isLoadingPromoted ? (
            <RowSkeleton cardClassName="aspect-square w-[184px]" />
          ) : (
            promotedPlaces.map((place, index) => (
              <PlaceCard key={place.id} place={place} priority={index < EAGER_IN_ROW} />
            ))
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

              {hasMoreSoonExperiences && (
                <SeeAllCard
                  href="/experiences"
                  previewPhotos={soonExperiences.slice(0, 3).map(coverPhotoOf)}
                />
              )}
            </>
          )}
        </CardRail>
      )}

      {(isLoadingCities || cities.length > 0) && (
        <CardRail title="Discover by city" subtitle="Switch the city and everything above follows">
          {isLoadingCities ? (
            <RowSkeleton cardClassName="aspect-[8/3] w-[184px]" />
          ) : (
            cities.map((category) => (
              <CityCard
                key={category.id}
                variant="banner"
                city={category.name}
                imageUrl={categoryImageOf(category) ?? ''}
                href={cityExperiencesHref(category.name)}
              />
            ))
          )}
        </CardRail>
      )}

      {/* Tours are experiences the API provisions behind a guide's profile,
          so `experience_type=guide_booking` is the whole query - there is no
          separate tours endpoint, and GET /guides/ returns profiles with no
          title, photo or date to put on a card. */}
      {(isLoadingTours || guidedTours.length > 0) && (
        <CardRail
          title="Guided tours"
          subtitle={toursSubtitle}
          seeAllHref={hasMoreTours ? '/experiences' : undefined}
        >
          {isLoadingTours ? (
            <RowSkeleton cardClassName="aspect-square w-[184px]" />
          ) : (
            guidedTours.map((tour, index) => (
              <ExperienceCard key={tour.id} experience={tour} priority={index < EAGER_IN_ROW} />
            ))
          )}
        </CardRail>
      )}

      {/* The canvas lays this one out as a grid the header's arrows page,
          not as a rail. `has_experiences=true` is exactly what the heading
          says, so the section is the honest one of the two.

          ⚠️ The canvas also draws a "Closed · Opens 10 AM" pill over each
          photo here. Hours are not on the place list serializer - they hang
          off a reservation profile, two requests per place - so the pill is
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

      {(isLoadingOrganising || organisingCommunities.length > 0) && (
        <section>
          <SectionHeader title="Communities organising things" seeAllHref="/communities" />

          {isLoadingOrganising ? (
            <RowGridSkeleton />
          ) : (
            <div className={ROW_GRID}>
              {organisingCommunities.map((community, index) => (
                <CommunityRow
                  key={community.id}
                  community={community}
                  priority={index < EAGER_IN_ROW}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* A rail of tall cards closed by an invitation to post one, with See
          all in the header - not the masonry the Moments page uses, which was
          going into this rail as a column layout. */}
      {(isLoadingMoments || moments.length > 0) && (
        <CardRail
          title="Recent moments"
          subtitle={MOMENTS_SUBTITLE}
          seeAllHref="/moments"
          showArrows={false}
        >
          {isLoadingMoments ? (
            <RowSkeleton cardClassName="aspect-[3/4] w-[265px]" />
          ) : (
            <>
              {moments.map((moment, index) => (
                <MomentCard
                  key={moment.id}
                  moment={moment}
                  priority={index < EAGER_IN_ROW}
                  onClick={() => setOpenMoment(moment)}
                />
              ))}

              <MomentComposeCard onClick={() => setIsComposerOpen(true)} />
            </>
          )}
        </CardRail>
      )}

      {(isLoadingPublicLists || publicLists.length > 0) && (
        <section>
          <SectionHeader
            title="Public bucket lists"
            action={
              publicLists.length > ROW_GRID_SIZE ? (
                <ShowMoreButton
                  isExpanded={visibleListCount >= publicLists.length}
                  onExpand={() => setVisibleListCount(publicLists.length)}
                  onCollapse={() => setVisibleListCount(ROW_GRID_SIZE)}
                />
              ) : undefined
            }
          />

          {isLoadingPublicLists ? (
            <RowGridSkeleton gridClassName={PUBLIC_LISTS_GRID} />
          ) : (
            <div className={PUBLIC_LISTS_GRID}>
              {shownPublicLists.map((bucketList, index) => (
                <BucketListRow
                  key={bucketList.id}
                  bucketList={bucketList}
                  priority={index < EAGER_IN_ROW}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <MomentDrawer moment={openMoment} onClose={() => setOpenMoment(null)} />
      <MomentComposer open={isComposerOpen} onOpenChange={setIsComposerOpen} />
    </PageContainer>
  );
};
