import Link from 'next/link';
import SinglePlace from '@/app/home/components/place';
import { Place } from '@/types/place';

type listPlacesProps = {
  initialPlaces: Place[];
  selectedCategoryId: string;
};
export default function ListPlaces({ initialPlaces }: listPlacesProps) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
      {initialPlaces.map((place: Place) => (
        <Link href={`/experiences/${place.id}`} key={place.id}>
          <div className="cursor-pointer">
            <SinglePlace place={place} />
          </div>
        </Link>
      ))}
    </div>
  );
}
