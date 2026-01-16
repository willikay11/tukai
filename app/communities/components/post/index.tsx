'use client';

import { useState } from 'react';

import Link from 'next/link';

import { FavouriteIcon, Message02Icon } from '@hugeicons/react-pro';

import IconComponent from '@/app/components/iconComponent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ImageCarousel from '@/components/ui/imageCarousel';
import { CommunityPost } from '@/types/community';
import { Photo } from '@/types/photo';

export default function Post({
  post,
  showCommunityTitle = true,
}: {
  post: CommunityPost;
  showCommunityTitle?: boolean;
}) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.totalLikes ?? 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="flex flex-col rounded-lg bg-white p-2">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.createdBy.picture} alt={post.createdBy.firstName} />
            <AvatarFallback>
              {post.createdBy.firstName[0]}
              {post.createdBy.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-gray-900">
              {post.createdBy.firstName} {post.createdBy.lastName}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              {showCommunityTitle && (
                <>
                  <span className="text-gray-400">in</span>
                  <Link
                    href={`/communities/${post.community.id}`}
                    className="flex items-center gap-1 font-medium text-primary hover:underline"
                  >
                    <span>{post.community.title}</span>
                  </Link>
                  <span className="mx-1 text-gray-400">•</span>
                </>
              )}
              <span className="text-gray-400">{formatDate(post.dateCreated)}</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600">
          <IconComponent iconName="MoreHorizontalCircle01Icon" size={20} />
        </Button>
      </div>

      {post.photos.length > 0 && (
        <div className="mt-2 w-full">
          <ImageCarousel images={post.photos.map((photo: Photo) => photo.photo)} width='w-[25.635rem]' />
        </div>
      )}

      {post.title && <p className="mt-2 text-sm font-semibold text-gray-700">{post?.title}</p>}

      {/* Content */}
      <div className="mb-4">
        <p className="text-sm leading-relaxed text-gray-700">{post.description}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-gray-900"
        >
          <FavouriteIcon
            size={20}
            variant={isLiked ? 'solid' : 'stroke'}
            className={isLiked ? 'text-red-500' : ''}
          />
          <span className="text-sm">{likesCount} Likes</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-2 py-1 text-gray-600 hover:text-gray-900"
        >
          <Message02Icon size={20} variant="stroke" />
          <span className="text-sm">Comment</span>
        </Button>
      </div>
    </div>
  );
}
