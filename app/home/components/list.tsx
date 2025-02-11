'use client';
import Link from 'next/link';
import SinglePlace from '@/app/home/components/place';
import { Place } from '@/types/place';
import { usePlaces } from '@/hooks/places';
import { EventsSkeleton } from '@/app/components/skeletons';

type listPlacesProps = {
  selectedCategoryId?: string;
};
export default function ListPlaces({ selectedCategoryId }: listPlacesProps) {
  // Fetch places based on the selected filter category
  const { data: places, isLoading } = usePlaces({ categoryId: selectedCategoryId, enabled: true });

  if (isLoading) return <EventsSkeleton />;

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
      {places?.data?.results.map((place: Place) => (
        <Link href={`/experiences/${place.id}`} key={place.id}>
          <div className="cursor-pointer">
            <SinglePlace place={place} />
          </div>
        </Link>
      ))}
    </div>
  );
}
