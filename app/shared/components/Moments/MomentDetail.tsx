'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useFlagMoment, useToggleMomentLike } from '@/app/shared/hooks/useMoments';
import { toast } from '@/app/shared/hooks/useToast';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { Moment, momentAuthorName, momentContext, momentPhotos } from '@/types/moment';
import { CANVAS_ICONS } from '@/utils/canvas-icons';

import { FlagReasonPicker } from './FlagReasonPicker';
import { MomentAvatar } from './MomentAvatar';
import { MomentComments } from './MomentComments';

export const MomentDetail = ({ moment: item }: { moment: Moment }) => {
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user?.id);
  const { openSignInWithCallback } = useAuthDialog();
  const { mutate: toggleLike } = useToggleMomentLike();
  const { mutate: flag, isPending: isFlagging } = useFlagMoment();
  const [isFlagOpen, setIsFlagOpen] = useState(false);

  // Seeded from the server so a moment the user already liked shows lit on
  // load; falls back to false when the serializer omits is_liked
  const [isLiked, setIsLiked] = useState(item.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(item.totalLikes);

  // Only media that can actually be rendered - a null photo throws in next/image
  const photos = momentPhotos(item);
  const authorName = momentAuthorName(item.author);
  const context = momentContext(item);

  const like = () => {
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

  // Anyone can read a moment; liking one needs an account. Signing in carries
  // straight on to the like, so the one press they made is the one that lands.
  // `like` is handed over rather than this handler: the callback runs with the
  // closure it was created in, where `isSignedIn` is still false.
  const onLike = () => (isSignedIn ? like() : openSignInWithCallback(like));

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
                : 'Thanks, our team will take a look.',
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
    <div className="flex flex-1 flex-col">
      {/* The name yields rather than pushing anything else off the row */}
      <div className="flex min-w-0 items-center gap-3">
        <MomentAvatar src={item.author.picture} name={authorName} size={44} />
        <div className="min-w-0">
          <p className="truncate font-bold text-gray-900">{authorName}</p>
          <p className="text-sm text-gray-400">{moment(item.dateCreated).format('D MMM')}</p>
        </div>
      </div>

      {/* One body of text, not two. The composer asks a single question and
          sends the first line as `title` and the whole thing as `description`,
          so showing both printed the same words twice - bold, then again in
          full. The description is always the longer of the two; the title is
          only a fallback for a moment posted without one. */}
      <p className="mt-4 text-base leading-relaxed text-gray-900">
        {item.description || item.title}
      </p>

      {/* The carousel shows even for one photo, so a moment looks the same
          whether it has one picture or many. Tiles run off the right edge,
          which is what tells the reader there is more to scroll to */}
      {photos.length > 0 && (
        <div className="-mr-4 mt-4 flex gap-2 overflow-x-auto pr-4 scrollbar-hide">
          {photos.map((media, index) => (
            <div
              key={media.id}
              className="relative h-80 w-60 flex-shrink-0 overflow-hidden rounded-xl"
            >
              <PhotoImage
                src={media.photo}
                alt={`${item.title} photo ${index + 1}`}
                fill
                sizes="240px"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      )}

      {context && (
        <p className="mt-4 flex min-w-0 items-center gap-2 text-sm font-semibold text-primary">
          <IconComponent iconName={CANVAS_ICONS[context.icon]} size={18} color="currentColor" />
          <span className="truncate">{context.label}</span>
          {/* The canvas pairs the parent with its own icon: a title alone does
              not say what kind of thing it is */}
          <span className="sr-only">({context.kind})</span>
        </p>
      )}

      <div className="mt-5 flex items-center gap-6">
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
          onClick={() =>
            isSignedIn ? setIsFlagOpen(true) : openSignInWithCallback(() => setIsFlagOpen(true))
          }
          className="ml-auto text-gray-300 hover:text-gray-500"
          aria-label="Report this moment"
        >
          <IconComponent iconName="Flag01Icon" size={18} color="currentColor" />
        </button>
      </div>

      <MomentComments momentId={item.id} totalComments={item.totalComments} />

      <FlagReasonPicker
        open={isFlagOpen}
        onOpenChange={setIsFlagOpen}
        onSelect={onFlag}
        isSubmitting={isFlagging}
      />
    </div>
  );
};
