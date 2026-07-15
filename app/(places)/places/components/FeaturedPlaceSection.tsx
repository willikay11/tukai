'use client';

import { useRouter } from 'next/navigation';

import { FeaturedBanner } from '@/app/shared/components/Banners';
import { usePlaces } from '@/app/shared/hooks/usePlaces';
import { Photo } from '@/types/photo';
import { Place } from '@/types/place';

// TODO(backend): no featured-places endpoint exists — the first place from the
// default list stands in. The API also has no price data for places, so the
// average price below is FAKE placeholder copy until a price field ships.
const FAKE_AVERAGE_PRICE = 'Ksh. 3,500 avg';

export const FeaturedPlaceSection = () => {
  const router = useRouter();

  const { data: placesResponse, isLoading } = usePlaces({ page: 1, enabled: true });
  const featuredPlace: Place | undefined = placesResponse?.data?.results?.[0];

  if (isLoading) {
    return (
      <div className="mb-6 aspect-[16/9] w-full animate-pulse rounded-2xl bg-gray-200 md:aspect-[3/1]" />
    );
  }

  if (!featuredPlace) {
    return null;
  }

  const coverPhoto =
    featuredPlace.photos?.find((photo: Photo) => photo.isCover)?.photo ||
    featuredPlace.photos?.[0]?.photo ||
    null;

  const metaItems = [
    featuredPlace.categories?.[0]?.name,
    featuredPlace.location?.city,
    FAKE_AVERAGE_PRICE,
  ].filter(Boolean) as string[];

  return (
    <div className="mb-6">
      <FeaturedBanner
        badgeLabel="Featured This Week"
        coverPhoto={coverPhoto}
        title={featuredPlace.title}
        metaItems={metaItems}
        rating={featuredPlace.averageRating || null}
        ctaLabel="Reserve a table"
        // No place reservation flow exists — route to the place detail page
        onCtaClick={() => router.push(`/places/${featuredPlace.id}`)}
      />
    </div>
  );
};
