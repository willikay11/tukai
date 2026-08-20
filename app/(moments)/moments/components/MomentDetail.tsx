'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Image from 'next/image';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { SquarePhotoStrip } from '@/app/shared/components/Images/SquarePhotoStrip';
import { useFlagMoment, useToggleMomentLike } from '@/app/shared/hooks/useMoments';
import { toast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Moment, momentAuthorName } from '@/types/moment';

import { FlagReasonPicker } from './FlagReasonPicker';
import { MomentAvatar } from './MomentAvatar';
import { MomentComments } from './MomentComments';

// Whatever the moment was posted against, in the order the design shows it
const contextLabel = (item: Moment): string | null =>
  item.community?.title || item.experience?.title || item.place?.title || null;

export const MomentDetail = ({ moment: item }: { moment: Moment }) => {
  const { data: session } = useSession();
  const { mutate: toggleLike } = useToggleMomentLike();
  const { mutate: flag, isPending: isFlagging } = useFlagMoment();
  const [isFlagOpen, setIsFlagOpen] = useState(false);

  // ⚠️ No is_liked on the moment serializer, so this starts false on every
  // load and only reflects toggles made in this session
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.totalLikes);

  const authorName = momentAuthorName(item.author);
  const context = contextLabel(item);
  const isOwnMoment = session?.user?.id === item.author.id;

  const onLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((count) => count + (next ? 1 : -1));
    toggleLike(item.id, {
      onSuccess: (result) => setIsLiked(result.isLiked),
      onError: () => {
        setIsLiked(!next);
        setLikeCount((count) => count + (next ? -1 : 1));
      },
    });
  };

  const onFlag = (reasonId: string) =>
    flag(
      { momentId: item.id, reasonId },
      {
        onSuccess: (result) => {
          setIsFlagOpen(false);
          toast({
            title: result.status === 204 ? 'Already reported' : 'Reported',
            description:
              result.status === 204
                ? 'You have already reported this moment.'
                : 'Thanks — our team will take a look.',
          });
        },
        onError: () =>
          toast({
            title: 'Could not report',
            description: 'Please try again.',
            variant: 'destructive',
          }),
      },
    );

  return (
    <div>
      {/* The pane is a quarter of the page, so the name has to yield rather
          than push the Follow button out */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <MomentAvatar src={item.author.picture} name={authorName} size={44} />
          <div className="min-w-0">
            <p className="truncate font-bold text-gray-900">{authorName}</p>
            <p className="truncate text-sm text-gray-400">
              {moment(item.dateCreated).fromNow()}
              {context && ` · ${context}`}
            </p>
          </div>
        </div>

        {!isOwnMoment && (
          // ⚠️ Disabled: no follow endpoint exists on the API yet
          <Button
            variant={item.author.isFollowing ? 'outline' : 'default'}
            disabled
            title="Following is not available yet"
            className="flex-shrink-0 rounded-full px-5"
          >
            {item.author.isFollowing ? 'Following' : 'Follow'}
          </Button>
        )}
      </div>

      {item.media.length === 1 ? (
        <div className="mt-4 overflow-hidden rounded-2xl">
          <Image
            src={item.media[0].photo}
            alt={item.title}
            width={item.media[0].width || 800}
            height={item.media[0].height || 800}
            sizes="(max-width: 1024px) 100vw, 600px"
            className="h-auto w-full object-cover"
          />
        </div>
      ) : (
        <SquarePhotoStrip
          photos={item.media.map((media) => media.photo)}
          variant="hero"
          className="mt-4"
        />
      )}

      <p className="mt-4 text-xl font-bold text-gray-900">{item.title}</p>
      {item.description && (
        <p className="mt-2 text-base leading-relaxed text-gray-700">{item.description}</p>
      )}

      <div className="mt-4 flex items-center gap-6">
        <button type="button" onClick={onLike} className="flex items-center gap-2">
          <IconComponent
            iconName="FavouriteIcon"
            size={20}
            variant={isLiked ? 'solid' : 'twotone'}
            className={isLiked ? 'text-red-500' : 'text-gray-500'}
          />
          <span className="text-sm text-gray-700">{likeCount}</span>
        </button>

        <div className="flex items-center gap-2">
          <IconComponent iconName="Comment01Icon" size={20} className="text-gray-500" />
          <span className="text-sm text-gray-700">{item.totalComments}</span>
        </div>

        <button
          type="button"
          onClick={() => setIsFlagOpen(true)}
          className="ml-auto text-gray-300 hover:text-gray-500"
          aria-label="Report this moment"
        >
          <IconComponent iconName="Flag01Icon" size={18} color="currentColor" />
        </button>
      </div>

      <MomentComments momentId={item.id} />

      <FlagReasonPicker
        open={isFlagOpen}
        onOpenChange={setIsFlagOpen}
        onSelect={onFlag}
        isSubmitting={isFlagging}
      />
    </div>
  );
};
