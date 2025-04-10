'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Reviews from './reviews';
import NoData from '@/components/ui/noData';

type placeTabsProps = {
  placeId: string;
};

export default function PlaceTabs({ placeId }: placeTabsProps) {
  return (
    <Tabs defaultValue="reviews" className="w-1/2">
      <TabsList className="sticky top-0 z-50 w-full bg-white rounded-none">
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="experiences">Experiences</TabsTrigger>
        <TabsTrigger value="community">Community</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
      </TabsList>
      <TabsContent value="reviews">
        <Reviews placeId={placeId} />
      </TabsContent>
      <TabsContent value="experiences">
        <div className="my-2">
          <NoData message="No experiences" />
        </div>
      </TabsContent>
      <TabsContent value="community">
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
