import { PAGE_GRID } from '@/app/shared/components/Layout';
import { cn } from '@/lib/utils';

import { DiscoverByCity } from './components/DiscoverByCity';
import { NearbyPlaces } from './components/NearbyPlaces';
import { PlacesByCity } from './components/PlacesByCity';
import { PlacesWithExperiences } from './components/PlacesWithExperiences';
import { PopularPlaces } from './components/PopularPlaces';
import { PromotedPlaces } from './components/PromotedPlaces';
import { ListPlaces } from './components/list';

export default async function Home() {
  return (
    <main className={cn(PAGE_GRID, 'mt-4 h-full')}>
      <div className="col-span-12 mb-4">
        <PromotedPlaces />
        <DiscoverByCity />
        <NearbyPlaces />
        <PlacesWithExperiences />
        <PopularPlaces />
        <PlacesByCity />
        <ListPlaces />
      </div>
    </main>
  );
}
