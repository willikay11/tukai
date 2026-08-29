'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Rating } from '@/app/shared/components/Rating/Rating';
import { useMyPlaces } from '@/app/shared/hooks/usePlaces';
import { Photo } from '@/types/photo';
import { Place } from '@/types/place';
import { PlaceCategory } from '@/types/placeCategory';

const coverOf = (place: Place): string | undefined =>
  place.photos?.find((photo: Photo) => photo.isCover)?.photo || place.photos?.[0]?.photo;

const PlaceCardSkeleton = () => (
  <div
    role="status"
    aria-label="Loading your places"
    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
  >
    <div className="aspect-[16/10] w-full animate-pulse bg-gray-100" />
    <div className="space-y-2 p-4">
      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
    </div>
  </div>
);

/**
 * The places this host owns. Ownership is held by a community they run, and
 * `GET /places/?mine=true` resolves that server-side — the client has no owner
 * field on Place to filter by itself.
 */
export const YourPlaces = () => {
  const { data: response, isLoading } = useMyPlaces();
  const places: Place[] = response?.data?.results ?? [];

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Places</h2>
          <p className="mt-0.5 text-sm text-gray-400">
            Listings you own that take reservations on Tukai
          </p>
        </div>

        {/* Claiming is how a place becomes yours — there is no separate
            create-and-own path */}
        <Link
          href="/places/claim"
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <IconComponent iconName="PlusSignIcon" size={16} color="currentColor" />
          Add a place
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
            <PlaceCardSkeleton />
          </>
        ) : (
          <>
            {places.map((place) => {
              const category = place.categories?.find(
                (entry: PlaceCategory) => entry.group === 'interests',
              )?.name;

              return (
                <Link
                  key={place.id}
                  href={`/places/${place.id}`}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-colors hover:border-gray-200"
                >
                  <div className="relative aspect-[16/10] w-full">
                    <PhotoImage
                      src={coverOf(place)}
                      alt={place.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <p className="truncate font-bold text-gray-900">{place.title}</p>
                    <p className="mt-0.5 truncate text-sm text-gray-400">
                      {[category, place.location?.city].filter(Boolean).join(' · ') ||
                        'Location not set'}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      {place.totalReviews ? (
                        <Rating rating={place.averageRating} showCount />
                      ) : (
                        <span className="text-sm text-gray-400">No reviews yet</span>
                      )}
                      <span className="flex items-center gap-1 text-sm font-semibold text-gray-900 group-hover:text-primary">
                        View
                        <IconComponent iconName="ArrowRight01Icon" size={14} color="currentColor" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* The add tile trails the list, and stands in for it when empty */}
            <Link
              href="/places/claim"
              className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 text-center hover:border-gray-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                <IconComponent
                  iconName="PlusSignIcon"
                  size={20}
                  color="currentColor"
                  className="text-gray-500"
                />
              </div>
              <p className="mt-3 font-semibold text-gray-700">Add a place</p>
              <p className="mt-1 text-xs text-gray-400">
                {places.length === 0 ? 'Claim a place your community owns' : 'Claim another place'}
              </p>
            </Link>
          </>
        )}
      </div>
    </section>
  );
};
