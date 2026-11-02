'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { isListMember } from '@/app/(experiences)/experiences/components/BucketListCard/bucket-list-card';
import { IconComponent } from '@/app/shared/components/Icons';
import {
  useBucketList,
  useDeleteBucketList,
  useJoinPublicBucketList,
  useLeaveBucketList,
} from '@/app/shared/hooks/useBucketLists';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { BucketListDetail, BucketListItem } from '@/types/bucket-list';
import { linkedUserName } from '@/types/user';
import { canvasIcon } from '@/utils/canvas-icons';

import { BucketListConfirmDialog } from './BucketListConfirmDialog';
import { BucketListFace } from './BucketListFace';
import { BucketListItemCard } from './BucketListItemCard';
import { BucketListPanelFrame } from './BucketListPanelFrame';
import {
  BUCKET_LIST_UNAVAILABLE_COPY,
  BucketListNav,
  bucketListConfirmCopy,
  bucketListConfirmDoneToast,
  bucketListUnavailableReason,
  canAddToBucketList,
} from './bucket-list-drawer';

const LIME_MAIN =
  'h-12 flex-shrink-0 rounded-full pl-5 pr-6 text-[15px] font-semibold transition-[background-color,box-shadow] duration-200 hover:shadow-[0_6px_16px_rgba(176,232,0,.4)] active:scale-[.97]';

const Loading = () => (
  <div className="space-y-4" role="status" aria-label="Loading">
    <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
    <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
    <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="aspect-square animate-pulse rounded-xl bg-gray-200" />
      ))}
    </div>
  </div>
);

export const BucketListUnavailable = ({ status }: { status?: number }) => {
  const reason = bucketListUnavailableReason(status);
  const copy = BUCKET_LIST_UNAVAILABLE_COPY[reason];

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-surface px-6 py-10 text-center">
      <IconComponent
        iconName={canvasIcon('hgi-square-lock-02')!}
        size={36}
        color="currentColor"
        className="text-brand"
      />
      <p className="text-lg font-semibold text-gray-800 [text-wrap:balance]">{copy.title}</p>
      <p className="max-w-[40ch] text-[15px] leading-[1.55] text-ink-muted [text-wrap:pretty]">
        {copy.line}
      </p>
    </div>
  );
};

/** Copies a list's link and says who it works for. */
export const useCopyBucketListLink = () => {
  const { toast } = useToast();

  return async (bucketListId: string, message: string) => {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_APP_URL}/bucket-lists/${bucketListId}`,
      );
      toast({ title: message, variant: 'success' });
    } catch {
      // A denied clipboard is not worth an error dialog
    }
  };
};

const ItemSection = ({ title, items }: { title: string; items: BucketListItem[] }) =>
  items.length === 0 ? null : (
    <section className="flex flex-col gap-4">
      <h3 className="text-22 font-bold tracking-[-0.3px] text-gray-800">{title}</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-4 gap-y-6">
        {items.map((item) => (
          <BucketListItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );

const EmptyList = ({ canAdd, onExplore }: { canAdd: boolean; onExplore: () => void }) => (
  <div className="flex flex-col items-center gap-3 rounded-xl bg-surface px-6 py-9 text-center">
    <IconComponent
      iconName={canvasIcon('hgi-shopping-basket-add-02')!}
      variant="bulk"
      size={40}
      color="currentColor"
      className="text-brand"
    />
    <span className="text-[17px] font-semibold text-gray-800">
      {canAdd ? 'Nothing saved here yet' : 'Nothing on this list yet'}
    </span>
    <p className="max-w-[40ch] text-[15px] leading-[1.55] text-ink-muted [text-wrap:pretty]">
      {canAdd
        ? 'Tap the basket on any experience or place to add it to this list.'
        : 'When the owner adds experiences and places, they show up here.'}
    </p>

    {canAdd && (
      <div className="mt-1.5 flex flex-wrap justify-center gap-2.5">
        <Button
          asChild
          variant="lime"
          className="h-12 rounded-full px-[22px] text-[15px] font-semibold hover:shadow-[0_6px_16px_rgba(176,232,0,.4)] active:scale-[.97]"
        >
          <Link href="/experiences" onClick={onExplore}>
            Explore experiences
          </Link>
        </Button>
        <Button
          asChild
          className="h-12 rounded-full bg-white px-[22px] text-[15px] font-semibold text-brand-ink hover:bg-surface-brand"
        >
          <Link href="/places" onClick={onExplore}>
            Explore places
          </Link>
        </Button>
      </div>
    )}
  </div>
);

/**
 * A bucket list, opened in the panel.
 *
 * The owner sees Edit and Delete, a member sees Leave, and a visitor to a
 * public list sees Join. A private list nobody has let the reader onto fails
 * to load at all, which this shows as "private" rather than as an error.
 */
export const BucketListView = ({
  bucketListId,
  nav,
}: {
  bucketListId: string;
  nav: BucketListNav;
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { toast } = useToast();
  const { needAuth } = useAuthDialog();
  const copyLink = useCopyBucketListLink();

  const [confirmKind, setConfirmKind] = useState<'delete' | 'leave' | null>(null);

  const { data: response, isLoading, error } = useBucketList(bucketListId);
  const bucketList: BucketListDetail | undefined = response?.data;

  const { mutate: deleteBucketList, isPending: isDeleting } = useDeleteBucketList();
  const { mutate: leaveBucketList, isPending: isLeaving } = useLeaveBucketList();
  const { mutate: joinBucketList, isPending: isJoining } = useJoinPublicBucketList();

  const back = nav.canGoBack ? nav.back : undefined;

  if (!bucketList) {
    return (
      <BucketListPanelFrame title="Bucket list" onBack={back} onClose={nav.close}>
        {isLoading ? (
          <Loading />
        ) : (
          <BucketListUnavailable status={(error as { status?: number } | null)?.status} />
        )}
      </BucketListPanelFrame>
    );
  }

  const isOwner = Boolean(userId) && bucketList.owner?.id === userId;
  const isMember = !isOwner && isListMember(bucketList);
  const isPublic = bucketList.visibility === 'public';
  const canAdd = canAddToBucketList(isOwner, isMember, isPublic);

  const items = bucketList.items ?? [];
  const experiences = items.filter((item) => item.experienceBookmark);
  const places = items.filter((item) => item.placeBookmark);
  const faces = (bucketList.members ?? []).filter(
    (member) => member.status === 'accepted' && member.user?.id !== bucketList.owner?.id,
  );
  const memberCount = bucketList.memberCount ?? faces.length;
  const memberLabel = `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`;

  const openMembers = () => nav.push({ kind: 'members', id: bucketList.id });
  const showInvite = isOwner && !isPublic;

  const fail = (title: string) => (failure: Error) =>
    toast({ title, description: failure.message, variant: 'destructive' });

  const handleConfirm = () => {
    if (!confirmKind) return;
    const done = bucketListConfirmDoneToast(confirmKind, bucketList);

    if (confirmKind === 'delete') {
      deleteBucketList(bucketList.id, {
        onSuccess: () => {
          setConfirmKind(null);
          toast({ title: done, variant: 'success' });
          nav.closeList(bucketList.id);
        },
        onError: fail('Could not delete'),
      });
      return;
    }

    leaveBucketList(bucketList.id, {
      onSuccess: () => {
        setConfirmKind(null);
        toast({ title: done, variant: 'success' });
        // A private list is gone the moment membership ends; a public one
        // stays open to read, now with a Join button of its own
        if (!isPublic) nav.closeList(bucketList.id);
      },
      onError: fail('Could not leave'),
    });
  };

  const join = () =>
    joinBucketList(bucketList.id, {
      onSuccess: () =>
        toast({
          title: `You joined ${bucketList.name}. It is in Following. Nothing was booked.`,
          variant: 'success',
        }),
      onError: fail('Could not join'),
    });

  const handleJoin = () => {
    if (!userId) {
      needAuth('join', join);
      return;
    }
    join();
  };

  const footer = isOwner ? (
    <>
      <Button
        variant="lime"
        onClick={() => nav.push({ kind: 'edit', id: bucketList.id })}
        className={LIME_MAIN}
      >
        <span className="flex items-center gap-2">
          <IconComponent iconName={canvasIcon('hgi-edit-04')!} color="currentColor" size={20} />
          Edit
        </span>
      </Button>

      <button
        type="button"
        onClick={() => setConfirmKind('delete')}
        className="flex h-12 flex-shrink-0 items-center gap-2 whitespace-nowrap px-1.5 text-[15px] font-medium text-gray-800 hover:underline"
      >
        <IconComponent
          iconName={canvasIcon('hgi-delete-01')!}
          color="currentColor"
          size={20}
          className="text-danger"
        />
        Delete
      </button>
    </>
  ) : isMember ? (
    <button
      type="button"
      onClick={() => setConfirmKind('leave')}
      className="flex h-12 flex-shrink-0 items-center gap-2 whitespace-nowrap px-1.5 text-[15px] font-medium text-danger hover:underline"
    >
      <IconComponent
        iconName={canvasIcon('hgi-logout-circle-02')!}
        color="currentColor"
        size={20}
      />
      Leave bucket list
    </button>
  ) : isPublic ? (
    <Button variant="lime" isLoading={isJoining} onClick={handleJoin} className={LIME_MAIN}>
      <span className="flex items-center gap-2">
        <IconComponent iconName="UserAdd02Icon" variant="bulk" color="currentColor" size={20} />
        Join bucket list
      </span>
    </Button>
  ) : null;

  return (
    <BucketListPanelFrame
      title={bucketList.name}
      onBack={back}
      onInvite={showInvite ? () => nav.push({ kind: 'invite', id: bucketList.id }) : undefined}
      onShare={
        showInvite
          ? undefined
          : () =>
              copyLink(
                bucketList.id,
                isPublic
                  ? 'Link copied. Anyone with it can view and join this list.'
                  : 'Member link copied. Only people on this list can open it.',
              )
      }
      onClose={nav.close}
      footer={footer}
    >
      <div className="flex flex-col gap-[30px]">
        <div className="flex flex-col gap-4">
          {bucketList.description && (
            <p className="text-base leading-[1.6] text-gray-800 [text-wrap:pretty]">
              {bucketList.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {bucketList.owner && (
              <button
                type="button"
                onClick={openMembers}
                aria-label={`${linkedUserName(bucketList.owner)}, owner of this list. See members`}
                className="-ml-1.5 inline-flex min-h-[52px] items-center gap-2.5 rounded-full py-1 pl-1.5 pr-4 text-left transition-colors hover:bg-surface"
              >
                <BucketListFace
                  user={bucketList.owner}
                  className="h-11 w-11"
                  initialClassName="text-base font-bold"
                  sizes="44px"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="whitespace-nowrap text-[15.5px] font-semibold leading-[1.3] text-gray-800">
                    {linkedUserName(bucketList.owner)}
                  </span>
                  <span className="whitespace-nowrap text-13 leading-[1.3] text-ink-muted">
                    {isOwner ? 'Owner (you)' : 'Owner'}
                  </span>
                </span>
              </button>
            )}

            {memberCount > 0 && (
              <button
                type="button"
                onClick={openMembers}
                aria-label={`See members, ${memberLabel}`}
                className="inline-flex h-12 items-center gap-2.5 rounded-full pl-1.5 pr-3.5 transition-colors hover:bg-surface"
              >
                {faces.length > 0 && (
                  <span className="flex pl-2">
                    {faces.slice(0, 3).map((member) => (
                      <BucketListFace
                        key={member.id}
                        user={member.user}
                        className="-ml-2 h-8 w-8 border-2 border-white"
                        initialClassName="text-13 font-bold"
                        sizes="32px"
                      />
                    ))}
                  </span>
                )}
                <span className="whitespace-nowrap text-[14.5px] font-semibold text-brand">
                  {memberLabel}
                </span>
              </button>
            )}

            <span className="inline-flex h-11 items-center gap-2 rounded-full bg-surface pl-4 pr-[18px] text-[15.5px] text-ink-muted">
              <IconComponent
                iconName={isPublic ? canvasIcon('hgi-view')! : canvasIcon('hgi-view-off-slash')!}
                size={21}
                color="currentColor"
              />
              {isPublic ? 'Public' : 'Private'}
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyList canAdd={canAdd} onExplore={nav.close} />
        ) : (
          <>
            <ItemSection title="Experiences" items={experiences} />
            <ItemSection title="Places" items={places} />
          </>
        )}
      </div>

      <BucketListConfirmDialog
        copy={confirmKind ? bucketListConfirmCopy(confirmKind, bucketList) : null}
        isPending={confirmKind === 'delete' ? isDeleting : isLeaving}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmKind(null)}
      />
    </BucketListPanelFrame>
  );
};
