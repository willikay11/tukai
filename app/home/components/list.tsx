import { ApiResponse, fetchPlaces } from '@/app/lib/data';
import { Place } from '@/app/lib/definitions';
import SinglePlace from '@/app/home/components/place';

export default async function ListPlaces() {
  const places: ApiResponse = await fetchPlaces();

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
      {places.data.results.map((place: Place) => (
        <div key={place.id} className="cursor-pointer">
          <SinglePlace place={place} />
        </div>
      ))}
    </div>
  );
}
