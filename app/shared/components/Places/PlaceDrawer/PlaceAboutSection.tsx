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

export const PlaceAboutSection = ({
  place,
  onReviewsClick,
}: {
  place: Place;
  onReviewsClick: () => void;
}) => {
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
            className="inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border border-line-soft bg-surface-muted pl-3 pr-4 text-[14.5px] text-ink transition-colors hover:border-line-brand hover:bg-surface-brand"
          >
            <IconComponent
              iconName="Location01Icon"
              size={19}
              color="currentColor"
              className="text-brand"
            />
            {city}
            {/* Distance only once the reader has shared where they are */}
            {distanceKm !== null && (
              <>
                <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-distance" />
                {`${distanceKm} km`}
              </>
            )}
            <IconComponent
              iconName="ArrowUpRight01Icon"
              size={17}
              color="currentColor"
              className="ml-1.5 text-brand"
            />
          </OpenInMapsLink>
        )}

        {/* Always shown: a place nobody has rated says so, and the row jumps to Reviews */}
        <button
          type="button"
          onClick={onReviewsClick}
          className="inline-flex h-11 items-center gap-[7px] whitespace-nowrap text-[14.5px] text-ink-pill transition-colors hover:text-brand"
        >
          {place.averageRating > 0 && (
            <>
              <IconComponent
                iconName="StarIcon"
                size={18}
                variant="bulk"
                color="currentColor"
                className="text-star"
              />
              <span className="font-semibold">{place.averageRating}</span>
              <span aria-hidden="true" className="h-[5px] w-[5px] rounded-full bg-distance" />
            </>
          )}
          <span>
            {reviews === 0
              ? 'No reviews yet'
              : `${reviews} ${reviews === 1 ? 'review' : 'reviews'}`}
          </span>
        </button>
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
