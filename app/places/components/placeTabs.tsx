'use client';

import { NoData } from '@/components/ui/noData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceCategory } from '@/types/placeCategory';

import TabExperiences from './experiences';
import Reviews from './reviews';

type placeTabsProps = {
  placeId: string;
  categories: PlaceCategory[];
};

export default function PlaceTabs({ placeId, categories }: placeTabsProps) {
  return (
    <Tabs defaultValue="reviews" className="w-full md:w-1/2">
      <TabsList className="sticky top-0 w-full justify-start rounded-none bg-white">
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="experiences">Experiences</TabsTrigger>
        <TabsTrigger value="communities">Communities</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
      </TabsList>
      <TabsContent value="reviews">
        <Reviews placeId={placeId} />
      </TabsContent>
      <TabsContent value="experiences">
        <TabExperiences categories={categories?.map((category) => category.id)} />
      </TabsContent>
      <TabsContent value="communities">
        <div className="my-2">
          <NoData message="No communities" />
        </div>
      </TabsContent>
      <TabsContent value="photos">
        <div className="my-2">
          <NoData message="No photos" />
        </div>
      </TabsContent>
    </Tabs>
  );
}
