import Link from 'next/link';
import SinglePlace from '@/app/home/components/place';
import { ApiResponse } from '@/types/apiResponse';
import { fetchPlaces } from '@/services/place';
import { Place } from '@/types/place';

export default async function ListPlaces() {
  const places: ApiResponse = await fetchPlaces();

  console.log('places: ', places);

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
      {places.data.results.map((place: Place) => (
        <Link href={`/experiences/${place.id}`} key={place.id}>
          <div className="cursor-pointer">
            <SinglePlace place={place} />
          </div>
        </Link>
      ))}
    </div>
  );
}
