'use client';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { FeaturedBanner } from '@/app/shared/components/Banners';
import { SingleExperience } from '@/app/shared/components/Experiences/Single';
import { ScrollRow } from '@/app/shared/components/Lists';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { useLocation } from '@/context/LocationContext';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import { formatShortDate } from '@/utils/date-utils';
import { haversineKm } from '@/utils/geo-utils';

const ROW_SIZE = 10;

const RowSkeleton = () => (
  <div className="flex gap-4 overflow-hidden">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="w-[280px] flex-shrink-0">
        <div className="aspect-[4/3] w-full animate-pulse rounded-xl bg-gray-200" />
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
      </div>
    ))}
  </div>
);

export const DiscoverHeroSection = () => {
  const router = useRouter();
  const { lat, lng } = useLocation();

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
    </main>
  );
};
