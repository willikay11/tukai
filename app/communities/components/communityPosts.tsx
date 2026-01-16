'use client';

import { useCommunityPosts } from '@/hooks/communities';
import { CommunityPost } from '@/types/community';

import Post from './post';
import clsx from 'clsx';

export default function CommunityPosts({}) {
  const { data: communityPosts } = useCommunityPosts({ page: 1 }, true);

  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-span-6 col-start-4">
        {communityPosts?.data?.results?.map((post: CommunityPost, index: number) => (
            <div key={post.id} className={clsx({
                'border-b-[1px] border-gray-100': index !== communityPosts.data.results.length - 1,
            })}>
                <Post post={post} />
            </div>
        ))}
      </div>
    </div>
  );
}
