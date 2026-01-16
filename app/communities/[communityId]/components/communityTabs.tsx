'use client';

import { clsx } from 'clsx';

import NoData from '@/components/ui/noData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCommunityPosts } from '@/hooks/communities';
import { CommunityPost } from '@/types/community';

import Post from '../../components/post';

type communityTabsProps = {
  communityId: string;
};

export default function CommunityTabs({ communityId }: communityTabsProps) {
  const { data: communityPosts } = useCommunityPosts({ community: communityId, page: 1 }, true);
  return (
    <Tabs defaultValue="posts" className="w-full md:w-[75%]">
      <TabsList className="sticky top-0 w-full justify-start rounded-none bg-white">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
      </TabsList>
      <TabsContent value="posts">
        {communityPosts?.data?.results?.map((post: CommunityPost, index: number) => (
          <div
            key={post.id}
            className={clsx({
              'border-b-[1px] border-gray-100': index !== communityPosts.data.results.length - 1,
            })}
          >
            <Post post={post} showCommunityTitle={false} />
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}
