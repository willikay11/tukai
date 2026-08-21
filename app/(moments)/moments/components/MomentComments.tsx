'use client';

import { useEffect, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  useAddComment,
  useMomentComments,
  useToggleCommentLike,
} from '@/app/shared/hooks/useMoments';
import { toast } from '@/app/shared/hooks/useToast';
import { MomentComment, momentAuthorName } from '@/types/moment';

import { MomentAvatar } from './MomentAvatar';

const CommentRow = ({ comment, momentId }: { comment: MomentComment; momentId: string }) => {
  const { mutate: toggleLike } = useToggleCommentLike(momentId);

  /**
   * The server does not tell us whether the signed-in user has liked a comment
   * (no is_liked on the serializer), so the heart has to start from a guess.
   * When that guess is wrong the toggle does the opposite of what the reader
   * asked for — clicking "like" on an already-liked comment removed the like
   * and the heart flashed red then went clear.
   *
   * The like endpoint does report the resulting state (201 liked / 204
   * unliked), so a contradicting response tells us the guess was wrong. We then
   * toggle once more to land on what the reader actually asked for. The retry
   * is capped at one, so an inconsistent server cannot loop.
   */
  const [likedOverride, setLikedOverride] = useState<boolean | null>(null);
  const [pendingDelta, setPendingDelta] = useState(0);

  // The optimistic delta is held until the invalidated list comes back with a
  // new total, otherwise the count snaps to the stale value and flickers
  const lastTotal = useRef(comment.totalLikes);
  useEffect(() => {
    if (comment.totalLikes !== lastTotal.current) {
      lastTotal.current = comment.totalLikes;
      setPendingDelta(0);
    }
  }, [comment.totalLikes]);

  const isLiked = likedOverride ?? comment.isLiked ?? false;
  // Server total plus whatever this session has changed but not yet refetched
  const likeCount = Math.max(comment.totalLikes + pendingDelta, 0);

  const name = momentAuthorName(comment.commenter);

  const runToggle = (intent: boolean, allowRetry: boolean) => {
    toggleLike(comment.id, {
      onSuccess: (result) => {
        if (result.isLiked === intent) {
          // The guess held: the server total moves by our delta, so keep it
          setLikedOverride(result.isLiked);
          return;
        }

        // The starting guess was wrong. Toggle again so the reader's intent
        // wins — the two calls cancel out, leaving the total unchanged.
        if (allowRetry) {
          setPendingDelta(0);
          runToggle(intent, false);
          return;
        }

        setLikedOverride(result.isLiked);
        setPendingDelta(0);
      },
      onError: () => {
        setLikedOverride(!intent);
        setPendingDelta(0);
      },
    });
  };

  const onLike = () => {
    const intent = !isLiked;
    setLikedOverride(intent);
    setPendingDelta(intent ? 1 : -1);
    runToggle(intent, true);
  };

  return (
    <div className="flex gap-3">
      <MomentAvatar src={comment.commenter.picture} name={name} size={32} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold text-gray-900">{name}</p>
          <span className="text-xs text-gray-400">{moment(comment.dateCreated).fromNow()}</span>
        </div>
        <p className="mt-0.5 break-words text-sm text-gray-700">{comment.content}</p>
      </div>

      <div className="flex flex-shrink-0 items-start">
        <button type="button" onClick={onLike} className="flex items-center gap-1">
          <IconComponent
            iconName="FavouriteIcon"
            size={14}
            variant={isLiked ? 'solid' : 'twotone'}
            className={isLiked ? 'text-red-500' : 'text-gray-400'}
          />
          <span className="text-xs text-gray-500">{likeCount}</span>
        </button>
      </div>
    </div>
  );
};

export const MomentComments = ({ momentId }: { momentId: string }) => {
  const { data: session } = useSession();
  const currentUserName = session?.user?.name ?? '';
  const currentUserImage = session?.user?.image ?? null;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMomentComments(momentId);
  const { mutate: addComment, isPending: isPosting } = useAddComment(momentId);
  const [draft, setDraft] = useState('');

  const comments: MomentComment[] = (data?.pages ?? []).flatMap(
    (page) => page?.data?.results ?? [],
  );

  const submit = () => {
    const content = draft.trim();
    if (!content || isPosting) return;

    addComment(content, {
      onSuccess: () => setDraft(''),
      onError: () =>
        toast({
          title: 'Could not post',
          description: 'Your comment was not saved. Please try again.',
          variant: 'destructive',
        }),
    });
  };

  return (
    <div className="mt-6">
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex gap-3">
              <div className="h-8 w-8 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400">No comments yet — be the first.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentRow key={comment.id} comment={comment} momentId={momentId} />
          ))}

          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
            >
              {isFetchingNextPage ? 'Loading…' : 'Show more comments'}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3 rounded-full border border-gray-200 bg-white py-2 pl-2 pr-4 shadow-sm">
          <MomentAvatar src={currentUserImage} name={currentUserName} size={40} />

          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && submit()}
            placeholder="Leave a comment..."
            aria-label="Leave a comment"
            className="min-w-0 flex-1 bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-400"
          />

          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || isPosting}
            aria-label="Post comment"
            className="flex-shrink-0 text-primary transition-opacity disabled:opacity-40"
          >
            <IconComponent iconName="Sent02Icon" size={24} color="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
};
