'use client';

import { useRouter } from 'next/navigation';

import { BackToExplore } from '@/app/(experiences)/experiences/components/BackToExplore';
import { DescriptionShowMore, OpenInMapsLink } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { SquarePhotoStrip } from '@/app/shared/components/Images/SquarePhotoStrip';
import { PageContainer } from '@/app/shared/components/Layout';
import { RevealOnScroll, useHasScrolled } from '@/app/shared/components/Motion';
import { Rating } from '@/app/shared/components/Rating/Rating';
import { MomentsGridSection, UpcomingExperiencesSection } from '@/app/shared/components/Sections';
import { Share } from '@/app/shared/components/Share';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useMoments } from '@/app/shared/hooks/useMoments';
import { useLocation } from '@/context/LocationContext';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { Moment } from '@/types/moment';
import { Photo } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';
import { placePath } from '@/utils/detail-paths';
import { haversineKm } from '@/utils/geo-utils';

import { MobilePlaceBar } from './MobilePlaceBar';
import { PlaceCommunitySection } from './PlaceCommunitySection';
import { PlaceDetailsSection } from './PlaceDetailsSection';
import { PlaceReviewsSection } from './PlaceReviewsSection';
import { PlaceSocialsSection } from './PlaceSocialsSection';
import { ReservationPanel } from './ReservationPanel';

export const PlaceDetailContent = ({ place }: { place: Place }) => {
  const router = useRouter();
  const { lat, lng } = useLocation();
  const isPanelLifted = useHasScrolled(200);

  const { data: experiencesResponse, isLoading: isLoadingExperiences } = useExperiences(
    { place: place.id, page: 1, page_size: 10 },
    true,
  );
  const experiences: Experience[] = experiencesResponse?.data?.results ?? [];

  const { data: momentsResponse, isLoading: isLoadingMoments } = useMoments({
    place: place.id,
    page_size: 12,
  });
  const moments: Moment[] = momentsResponse?.data?.results ?? [];

  const photos = (place.photos ?? [])
    .map((photo: Photo) => photo.photo)
    .filter((photo): photo is string => Boolean(photo));

  // Categories mix city and interest groups — the interest one names the kind
  // of place, as it does on the place cards
  const category = place.categories?.find(
    (entry: PlaceCategory) => entry.group === 'interests',
  )?.name;

  // The API returns no distance, so it is only known once the reader has set
  // their own location
  const placeLat = place.location?.point?.coordinates?.[1];
  const placeLng = place.location?.point?.coordinates?.[0];
  const distanceKm =
    lat !== undefined && lng !== undefined && placeLat && placeLng
      ? haversineKm(lat, lng, placeLat, placeLng)
      : null;

  // The location half of the meta line is what links out to Maps, so it is
  // built separately from the category that precedes it
  const locationLine = [place.location?.city, distanceKm !== null ? `${distanceKm} Kms away` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <PageContainer variant="detail" className="py-6">
      {/* Sticky on a phone only: there the app header scrolls away, so without
          this the way back and the way to share are reachable only at the very
          top of a long page. From lg the header stays put and the page is
          short enough beside the panel, so the row scrolls with the content.

          The negative margins let the background span the gutter while the row
          keeps the column's padding. */}
      <div className="sticky top-0 z-30 -mx-4 flex items-center justify-between gap-4 bg-white/95 px-4 py-3 backdrop-blur-sm lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <BackToExplore href="/places" label="Back to Places" />
        <Share
          coverPhoto={photos[0] ?? ''}
          title={place.title}
          link={`${process.env.NEXT_PUBLIC_APP_URL}${placePath(place)}`}
          kind="place"
        />
      </div>

      <div className="mt-4">
        <h1 className="text-3xl font-bold text-gray-900">{place.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <IconComponent iconName="Location01Icon" size={14} color="currentColor" />
          {category && <span>{locationLine ? `${category} ·` : category}</span>}
          {locationLine && (
            <OpenInMapsLink
              lat={placeLat}
              lng={placeLng}
              query={[place.title, place.location?.city].filter(Boolean).join(', ')}
            >
              {locationLine}
            </OpenInMapsLink>
          )}
          {place.averageRating > 0 && (
            <span className="flex items-center gap-1">
              · <Rating rating={place.averageRating} showCount />
              {place.totalReviews ? `(${place.totalReviews} Reviews)` : null}
            </span>
          )}
        </div>
      </div>

      {/* 7/5 of twelve rather than 8/4: the reservation panel reads as cramped
          at a third of the page, so it takes a column back from the content */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-7">
          {/* The same gallery the experience detail page uses for its hero */}
          {photos.length > 0 && <SquarePhotoStrip photos={photos} variant="hero" />}

          <div className="text-sm text-gray-600">
            <DescriptionShowMore text={place.description} maxLength={600} />
          </div>

          {/* Each section fades up as it is reached, as the experience page's
              do. The gallery and description above are not wrapped — they are
              on screen at load, so there is nothing to reveal. */}
          <RevealOnScroll>
            <PlaceDetailsSection properties={place.properties ?? []} />
          </RevealOnScroll>

          <RevealOnScroll>
            <PlaceSocialsSection links={place.socialLinks ?? []} />
          </RevealOnScroll>

          <RevealOnScroll>
            <PlaceCommunitySection />
          </RevealOnScroll>

          <RevealOnScroll>
            <UpcomingExperiencesSection
              hostName={place.title}
              experiences={experiences}
              isLoading={isLoadingExperiences}
            />
          </RevealOnScroll>

          <RevealOnScroll>
            <MomentsGridSection
              hostName={place.title}
              moments={moments}
              isLoading={isLoadingMoments}
            />
          </RevealOnScroll>

          <RevealOnScroll>
            <PlaceReviewsSection
              placeId={place.id}
              placeTitle={place.title}
              rating={place.averageRating}
              reviewCount={place.totalReviews}
            />
          </RevealOnScroll>
        </div>

        {/* Hidden below lg, where the bar's sheet is the way in — stacked
            under every section it was a long scroll from the top */}
        <div className="hidden lg:col-span-5 lg:block">
          {/* The shadow arrives once the reader has scrolled, so the panel
              reads as lifting off the page rather than carrying a shadow it
              never earned. `drop-shadow` follows the panel's rounded shape;
              `shadow` would draw a rectangle around this transparent wrapper. */}
          <div
            className={cn(
              'motion-reduce:transition-none lg:sticky lg:top-20 lg:transition lg:duration-300',
              isPanelLifted && 'lg:drop-shadow-xl',
            )}
          >
            <ReservationPanel placeId={place.id} placeName={place.title} />
          </div>
        </div>

        <MobilePlaceBar placeId={place.id} placeName={place.title} />
      </div>
    </PageContainer>
  );
};
