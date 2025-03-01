'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Reviews from './reviews';

type placeTabsProps = {
  placeId: string;
};

export default function PlaceTabs({ placeId }: placeTabsProps) {
  return (
    <Tabs defaultValue="reviews" className="w-3/4">
      <TabsList>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="experiences">Experiences</TabsTrigger>
        <TabsTrigger value="community">Community</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
      </TabsList>
      <TabsContent value="reviews">
        <Reviews placeId={placeId} />
      </TabsContent>
      <TabsContent value="password">Change your password here.</TabsContent>
    </Tabs>
  );
}
