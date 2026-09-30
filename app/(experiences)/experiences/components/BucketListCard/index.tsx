'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { AvatarStack } from '@/app/(experiences)/experiences/components/AvatarStack';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { CARD_LIFT, MEDIA_ZOOM, TITLE_TINT } from '@/app/shared/components/Motion';
import { useJoinBucketList, useLeaveBucketList } from '@/app/shared/hooks/useBucketLists';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BucketList, BucketListDetail, bucketListCoverPhoto } from '@/types/bucket-list';
import { linkedUserName } from '@/types/user';

import { CARD_STATE_LABEL, bucketListCardState, savedLine } from './bucket-list-card';

interface BucketListCardProps {
  bucketList: BucketList;
  /** Given one, the card is a link; otherwise the caller handles the press. */
  href?: string;
  onClick?: () => void;
}

const MemberFaces = ({ bucketList }: { bucketList: BucketList }) => {
  // Members ride on the detail serializer only. A card usually comes from the
  // collection, which carries the count and no people, so the faces appear
  // where they can and the count speaks for itself where they cannot.
  const members = (bucketList as BucketListDetail).members ?? [];
  const accepted = members.filter((member) => member.status === 'accepted');

  if (accepted.length === 0) {
    return bucketList.memberCount > 0 ? (
      <span className="flex items-center gap-1.5 text-sm text-gray-500">
        <IconComponent iconName="UserMultipleIcon" size={14} color="currentColor" />
        {bucketList.memberCount}
      </span>
    ) : null;
  }

  return (
    <AvatarStack
      size="sm"
      plainOverflow
      users={accepted.map((member) => ({
        id: member.id,
        name: linkedUserName(member.user),
        picture: member.user?.picture,
      }))}
      extraCount={Math.max(bucketList.memberCount - Math.min(accepted.length, 3), 0)}
    />
  );
};

const CardBody = ({ bucketList }: { bucketList: BucketList }) => (
  <>
    <div className="relative h-[220px]">
      <PhotoImage
        src={bucketListCoverPhoto(bucketList)}
        alt={bucketList.name}
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        className={cn('object-cover', MEDIA_ZOOM)}
      />

      <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-900">
        {bucketList.visibility === 'public' ? 'Public' : 'Private'}
      </div>
    </div>

    <div className="p-4">
      <p className={cn('text-base font-bold text-gray-900', TITLE_TINT)}>{bucketList.name}</p>

      {bucketList.owner && (
        <p className="mt-0.5 text-xs text-gray-400">by {linkedUserName(bucketList.owner)}</p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-gray-600">
          <IconComponent iconName="ShoppingBasket01Icon" size={14} className="text-primary" />
          {savedLine(bucketList)}
        </span>

        <MemberFaces bucketList={bucketList} />
      </div>
    </div>
  </>
);

/**
 * One list, in any of the canvas's three states: yours to open, one you are on,
 * or a public one you can join.
 */
export const BucketListCard = ({ bucketList, href, onClick }: BucketListCardProps) => {
  const { data: session } = useSession();
  const { toast } = useToast();

  const state = bucketListCardState(bucketList, session?.user?.id);
  const { mutate: joinBucketList, isPending: isJoining } = useJoinBucketList();
  const { mutate: leaveBucketList, isPending: isLeaving } = useLeaveBucketList();

  const shell = cn(
    'group block cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md',
    CARD_LIFT,
  );

  const press = () => {
    if (state === 'joined') {
      leaveBucketList(bucketList.id, {
        onSuccess: () =>
          toast({
            // The canvas says both halves: you are off it, and it is still there
            title: `You left ${bucketList.name}`,
            description:
              bucketList.visibility === 'public'
                ? 'The public list stays readable.'
                : 'You will need another invite to open it again.',
            variant: 'success',
          }),
        onError: (error: Error) =>
          toast({ title: 'Could not leave', description: error.message, variant: 'destructive' }),
      });
      return;
    }

    // Joining is done with the share token the list was handed out on
    if (!bucketList.shareToken) {
      toast({
        title: 'This list has no share link',
        description: 'Ask whoever owns it for an invite.',
        variant: 'destructive',
      });
      return;
    }

    joinBucketList(bucketList.shareToken, {
      onSuccess: () =>
        toast({
          title: `Joined ${bucketList.name}`,
          description: 'Nothing was booked.',
          variant: 'success',
        }),
      onError: (error: Error) =>
        toast({ title: 'Could not join', description: error.message, variant: 'destructive' }),
    });
  };

  // A list of your own opens: the button is the same link the card is, not an
  // action, which also keeps it working without a router
  const action = (
    <div className="px-4 pb-4">
      {state === 'owned' ? (
        href ? (
          <Link
            href={href}
            className={cn(buttonVariants({ variant: 'ghost' }), 'w-full rounded-full')}
          >
            {CARD_STATE_LABEL.owned}
          </Link>
        ) : (
          <Button type="button" variant="ghost" onClick={onClick} className="w-full rounded-full">
            {CARD_STATE_LABEL.owned}
          </Button>
        )
      ) : (
        <Button
          type="button"
          variant={state === 'joined' ? 'joined' : 'default'}
          isLoading={isJoining || isLeaving}
          onClick={(event) => {
            // The card itself is a link; the button is its own action
            event.preventDefault();
            event.stopPropagation();
            press();
          }}
          className="w-full rounded-full"
        >
          {CARD_STATE_LABEL[state]}
        </Button>
      )}
    </div>
  );

  if (href) {
    return (
      <div className={shell}>
        <Link href={href} className="block">
          <CardBody bucketList={bucketList} />
        </Link>
        {action}
      </div>
    );
  }

  return (
    <div className={shell}>
      <div onClick={onClick}>
        <CardBody bucketList={bucketList} />
      </div>
      {action}
    </div>
  );
};
