'use client';

import clsx from 'clsx';

import { PostSkeleton } from '@/app/components/skeletons';
import { useCommunityPosts } from '@/hooks/communities';
import { CommunityPost } from '@/types/community';

import Post from './post';

export default function CommunityPosts({}) {
  const { data: communityPosts, isLoading } = useCommunityPosts({ page: 1 }, true);

  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-12 md:col-span-6 md:col-start-4 lg:col-span-6 lg:col-start-4 xl:col-span-4 xl:col-start-5 3xl:col-span-4 3xl:col-start-5 4xl:col-span-6 4xl:col-start-4 md:mx-0">
        {isLoading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : (
          communityPosts?.data?.results?.map((post: CommunityPost) => (
            <div key={post.id} className="mb-4">
              <Post post={post} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
