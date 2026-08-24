'use client';

import { useRouter } from 'next/navigation';

import { BackToExplore } from '@/app/(experiences)/experiences/components/BackToExplore';
import { DescriptionShowMore, GoogleMapComponent } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { SquarePhotoStrip } from '@/app/shared/components/Images/SquarePhotoStrip';
import { PageContainer } from '@/app/shared/components/Layout';
import { Rating } from '@/app/shared/components/Rating/Rating';
import { MomentsGridSection, UpcomingExperiencesSection } from '@/app/shared/components/Sections';
import { Share } from '@/app/shared/components/Share';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useMoments } from '@/app/shared/hooks/useMoments';
import { useLocation } from '@/context/LocationContext';
import { Experience } from '@/types/experience';
import { Moment } from '@/types/moment';
import { Photo } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';
import { haversineKm } from '@/utils/geo-utils';

import { PlaceCommunitySection } from './PlaceCommunitySection';
import { PlaceDetailsSection } from './PlaceDetailsSection';
import { PlaceReviewsSection } from './PlaceReviewsSection';
import { PlaceSocialsSection } from './PlaceSocialsSection';
import { ReservationPanel } from './ReservationPanel';

export const PlaceDetailContent = ({ place }: { place: Place }) => {
  const router = useRouter();
  const { lat, lng } = useLocation();

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

  const metaLine = [
    category,
    place.location?.city,
    distanceKm !== null ? `${distanceKm} Kms away` : null,
  ].filter(Boolean);

  return (
    <PageContainer variant="detail" className="py-6">
      <div className="flex items-center justify-between gap-4">
        <BackToExplore href="/places" label="Back to Places" />
        <Share
          coverPhoto={photos[0] ?? ''}
          title={place.title}
          link={`${process.env.NEXT_PUBLIC_APP_URL}/places/${place.id}`}
        />
      </div>

      <div className="mt-4">
        <h1 className="text-3xl font-bold text-gray-900">{place.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <IconComponent iconName="Location01Icon" size={14} color="currentColor" />
          <span>{metaLine.join(' · ')}</span>
          {place.averageRating > 0 && (
            <span className="flex items-center gap-1">
              · <Rating rating={place.averageRating} showCount />
              {place.totalReviews ? `(${place.totalReviews} Reviews)` : null}
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          {/* The same gallery the experience detail page uses for its hero */}
          {photos.length > 0 && <SquarePhotoStrip photos={photos} variant="hero" />}

          <div className="text-sm text-gray-600">
            <DescriptionShowMore text={place.description} maxLength={600} />
          </div>

          <PlaceDetailsSection properties={place.properties ?? []} />
          <PlaceSocialsSection links={place.socialLinks ?? []} />
          <PlaceCommunitySection />

          <UpcomingExperiencesSection
            hostName={place.title}
            experiences={experiences}
            isLoading={isLoadingExperiences}
          />

          <MomentsGridSection
            hostName={place.title}
            moments={moments}
            isLoading={isLoadingMoments}
          />

          <PlaceReviewsSection
            placeId={place.id}
            rating={place.averageRating}
            reviewCount={place.totalReviews}
          />

          {placeLat && placeLng && (
            <div className="overflow-hidden rounded-2xl">
              <GoogleMapComponent lat={placeLat} lng={placeLng} />
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {/* Below the content on mobile, pinned alongside from lg up */}
          <div className="lg:sticky lg:top-20">
            <ReservationPanel placeId={place.id} placeName={place.title} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
