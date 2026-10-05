'use client';

import { DescriptionShowMore, OpenInMapsLink } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { useLocation } from '@/context/LocationContext';
import { photoUrl } from '@/types/photo';
import { Place } from '@/types/place';
import { haversineKm } from '@/utils/geo-utils';

import { PlaceFactsGrid } from './PlaceFactsGrid';
import { PlacePhotoStrip } from './PlacePhotoStrip';
import { PlaceSocialPills } from './PlaceSocialPills';

export const PlaceAboutSection = ({ place }: { place: Place }) => {
  const { lat, lng } = useLocation();

  const photos = (place.photos ?? [])
    .map((photo) => photoUrl(photo, 'md'))
    .filter((url): url is string => Boolean(url));

  const placeLat = place.location?.pointLat;
  const placeLng = place.location?.pointLong;
  const distanceKm =
    lat !== undefined && lng !== undefined && placeLat && placeLng
      ? haversineKm(lat, lng, placeLat, placeLng)
      : null;

  const city = place.location?.city ?? place.location?.name;
  const reviews = place.totalReviews ?? 0;

  return (
    <div className="space-y-6">
      <PlacePhotoStrip photos={photos} alt={place.title} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {city && (
          <OpenInMapsLink
            lat={placeLat}
            lng={placeLng}
            query={[place.title, city].filter(Boolean).join(', ')}
            className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-[15px] text-ink transition-colors hover:bg-surface-muted"
          >
            <IconComponent
              iconName="Location01Icon"
              size={18}
              color="currentColor"
              className="text-brand"
            />
            {city}
            {/* Distance only once the reader has shared where they are */}
            {distanceKm !== null && (
              <>
                <span className="text-ink-subtle">•</span>
                {`${distanceKm} km`}
              </>
            )}
          </OpenInMapsLink>
        )}

        {place.averageRating > 0 && (
          <span className="flex items-center gap-2 text-[15px]">
            <IconComponent
              iconName="StarIcon"
              size={18}
              variant="solid"
              className="text-[#FFC93C]"
            />
            <span className="font-bold text-brand-ink">{place.averageRating}</span>
            <span className="text-ink-subtle">•</span>
            <span className="text-ink-muted">
              {reviews} {reviews === 1 ? 'review' : 'reviews'}
            </span>
          </span>
        )}
      </div>

      {place.description && (
        <div className="text-[17px] leading-relaxed text-ink">
          <DescriptionShowMore text={place.description} maxLength={240} />
        </div>
      )}

      {(place.properties?.length ?? 0) > 0 && (
        <div className="border-t border-line pt-6">
          <PlaceFactsGrid properties={place.properties ?? []} />
        </div>
      )}

      {(place.socialLinks?.length ?? 0) > 0 && (
        <div className="border-t border-line pt-6">
          <h3 className="mb-4 text-[22px] font-bold text-brand-ink">Socials</h3>
          <PlaceSocialPills links={place.socialLinks ?? []} />
        </div>
      )}
    </div>
  );
};
