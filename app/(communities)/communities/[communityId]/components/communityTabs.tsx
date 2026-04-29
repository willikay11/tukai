'use client';

import Image from 'next/image';

import { clsx } from 'clsx';

import { ImageSkeleton, PostSkeleton } from '@/app/components/skeletons';
import { TukaiImage } from '@/components/ui/image';
import { NoData } from '@/components/ui/noData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCommunityPostPhotos, useCommunityPosts } from '@/hooks/communities';
import { CommunityPost } from '@/types/community';
import { Photo } from '@/types/photo';

import { Post } from '../../components/post';

type communityTabsProps = {
  communityId: string;
};

export const CommunityTabs = ({ communityId }: communityTabsProps) => {
  const { data: communityPosts, isLoading } = useCommunityPosts(
    { community: communityId, page: 1 },
    true,
  );

  const { data: communityPhotos, isLoading: photosLoading } = useCommunityPostPhotos(
    communityId,
    true,
  );

  return (
    <Tabs defaultValue="posts" className="w-full md:w-[75%] lg:w-full">
      <TabsList className="sticky top-0 w-full justify-start rounded-none bg-white">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
      </TabsList>
      <TabsContent value="posts">
        {isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : communityPosts?.data?.count > 0 ? (
          communityPosts?.data?.results?.map((post: CommunityPost, index: number) => (
            <div
              key={post.id}
              className={clsx({
                'border-b-[1px] border-gray-100': index !== communityPosts.data.results.length - 1,
              })}
            >
              <Post post={post} showCommunityTitle={false} />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center py-10">
            <NoData message="No posts found in this community" />
          </div>
        )}
      </TabsContent>
      <TabsContent value="photos">
        {photosLoading ? (
          <div className="grid h-[9.375rem] grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            <ImageSkeleton />
            <ImageSkeleton />
            <ImageSkeleton />
          </div>
        ) : communityPhotos?.data?.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {communityPhotos?.data?.map((photo: Photo) => (
              <div
                key={photo.id}
                className="relative aspect-square w-full overflow-hidden rounded-md"
              >
                <TukaiImage src={photo.photo} alt={`Community Photo ${photo.id}`} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-10">
            <NoData message="No photos found in this community" />
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
