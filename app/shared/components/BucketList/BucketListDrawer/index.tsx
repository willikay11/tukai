'use client';

import { useEffect, useState } from 'react';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import {
  SavedExperienceCard,
  SavedPlaceCard,
} from '@/app/(experiences)/bucket-lists/[bucketListId]/components/SavedItemCard';
import { isListMember } from '@/app/(experiences)/experiences/components/BucketListCard/bucket-list-card';
import { CreateBucketListModal } from '@/app/(experiences)/experiences/components/CreateBucketListModal';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import {
  useBucketList,
  useDeleteBucketList,
  useJoinBucketList,
  useLeaveBucketList,
} from '@/app/shared/hooks/useBucketLists';
import { useToast } from '@/app/shared/hooks/useToast';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { BucketListDetail, BucketListItem } from '@/types/bucket-list';
import { linkedUserName } from '@/types/user';
import { canvasIcon } from '@/utils/canvas-icons';

import { BucketListMembersView } from './BucketListMembersView';
import {
  BUCKET_LIST_UNAVAILABLE_COPY,
  BucketListConfirmKind,
  BucketListDrawerView,
  bucketListConfirmCopy,
  bucketListUnavailableReason,
  canAddToBucketList,
} from './bucket-list-drawer';

/** The round disc every drawer's header controls sit in. */
const DISC = 'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface';

const Loading = () => (
  <div className="space-y-4 px-6 py-6">
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

const Unavailable = ({ status }: { status?: number }) => {
  const reason = bucketListUnavailableReason(status);
  const copy = BUCKET_LIST_UNAVAILABLE_COPY[reason];

  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <IconComponent
        iconName={reason === 'locked' ? canvasIcon('hgi-square-lock-02')! : 'Alert02Icon'}
        size={36}
        color="currentColor"
        className="text-brand"
      />
      <p className="text-lg font-bold text-gray-900">{copy.title}</p>
      <p className="max-w-[40ch] text-[15px] leading-relaxed text-ink-muted">{copy.line}</p>
    </div>
  );
};

/**
 * A bucket list, opened over whatever the reader was looking at.
 *
 * The owner sees Edit and Delete, a member sees Leave, and a visitor to a
 * public list sees Join - the canvas's three footers. A private list nobody
 * has let the reader onto fails to load at all, which this shows as "private"
 * rather than as a generic error.
 */
export const BucketListDrawer = ({
  bucketListId,
  isOpen,
  onClose,
}: {
  bucketListId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { toast } = useToast();
  const { openSignInWithCallback } = useAuthDialog();

  const [view, setView] = useState<BucketListDrawerView>('list');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<BucketListConfirmKind | null>(null);

  useEffect(() => {
    setView('list');
    setIsEditOpen(false);
    setConfirmKind(null);
  }, [bucketListId]);

  const {
    data: response,
    isLoading,
    error,
  } = useBucketList(bucketListId ?? '', isOpen && Boolean(bucketListId));
  const bucketList: BucketListDetail | undefined = response?.data;
  const errorStatus = (error as any)?.status;

  const { mutate: deleteBucketList, isPending: isDeleting } = useDeleteBucketList();
  const { mutate: leaveBucketList, isPending: isLeaving } = useLeaveBucketList();
  const { mutate: joinBucketList, isPending: isJoining } = useJoinBucketList();

  if (!bucketList) {
    return (
      <Drawer isOpen={isOpen} setIsOpen={(next) => !next && onClose()} width="medium">
        <div className="flex min-h-full flex-col">
          <div className="flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted px-4">
            <h2 className="min-w-0 flex-1 truncate px-1.5 text-2xl font-bold tracking-[-0.4px] text-gray-800">
              Bucket list
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={`${DISC} text-danger transition-colors hover:bg-danger-surface`}
            >
              <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
            </button>
          </div>

          {isLoading ? <Loading /> : <Unavailable status={errorStatus} />}
        </div>
      </Drawer>
    );
  }

  const isOwner = Boolean(userId) && bucketList.owner?.id === userId;
  const isMember = isListMember(bucketList);
  const isPublic = bucketList.visibility === 'public';
  const canAdd = canAddToBucketList(isOwner, isMember, isPublic);

  const items = bucketList.items ?? [];
  const experiences = items.filter((item: BucketListItem) => item.experienceBookmark);
  const places = items.filter((item: BucketListItem) => item.placeBookmark);
  const acceptedMembers = (bucketList.members ?? []).filter(
    (member) => member.status === 'accepted',
  );

  const isMembers = view === 'members';
  const showInvite = isOwner && !isPublic;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_APP_URL}/bucket-lists/${bucketList.id}`,
      );
      toast({
        title: isPublic ? 'Link copied' : 'Member link copied',
        description: isPublic
          ? 'Anyone with it can view and join this list.'
          : 'Only people on this list can open it.',
        variant: 'success',
      });
    } catch {
      // A denied clipboard is not worth an error dialog
    }
  };

  const handleDelete = () =>
    deleteBucketList(bucketList.id, {
      onSuccess: () => {
        toast({
          title: `Deleted ${bucketList.name}`,
          description: 'The experiences and places on it are still on Tukai.',
          variant: 'success',
        });
        setConfirmKind(null);
        onClose();
      },
      onError: (error: Error) =>
        toast({ title: 'Could not delete', description: error.message, variant: 'destructive' }),
    });

  const handleLeave = () =>
    leaveBucketList(bucketList.id, {
      onSuccess: () => {
        toast({
          title: `You left ${bucketList.name}`,
          description: isPublic
            ? 'It is still public if you want to join again.'
            : 'Only the owner can invite you back.',
          variant: 'success',
        });
        setConfirmKind(null);
        // A private list is gone the moment membership ends; a public one
        // stays open to read, now with a Join button of its own
        if (!isPublic) onClose();
      },
      onError: (error: Error) =>
        toast({ title: 'Could not leave', description: error.message, variant: 'destructive' }),
    });

  const join = () =>
    joinBucketList(bucketList.shareToken ?? '', {
      onSuccess: () =>
        toast({
          title: `You joined ${bucketList.name}`,
          description: 'It is in Following. Nothing was booked.',
          variant: 'success',
        }),
      onError: (error: Error) =>
        toast({ title: 'Could not join', description: error.message, variant: 'destructive' }),
    });

  const handleJoin = () => {
    if (!bucketList.shareToken) {
      toast({
        title: 'This list has no share link',
        description: 'Ask whoever owns it for an invite.',
        variant: 'destructive',
      });
      return;
    }

    if (!userId) {
      openSignInWithCallback(join);
      return;
    }

    join();
  };

  const confirmCopy = confirmKind ? bucketListConfirmCopy(confirmKind, bucketList) : null;

  return (
    <Drawer isOpen={isOpen} setIsOpen={(next) => !next && onClose()} width="medium">
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted bg-white px-4">
          {isMembers && (
            <button
              type="button"
              onClick={() => setView('list')}
              aria-label="Back"
              className={`${DISC} text-brand hover:bg-surface-brand`}
            >
              <IconComponent iconName="ArrowLeft01Icon" size={20} color="currentColor" />
            </button>
          )}

          <h2 className="min-w-0 flex-1 truncate px-1.5 text-2xl font-bold tracking-[-0.4px] text-gray-800">
            {isMembers ? 'Members' : bucketList.name}
          </h2>

          {!isMembers && (
            <button
              type="button"
              onClick={handleCopyLink}
              aria-label={showInvite ? 'Invite members' : 'Share'}
              className={`${DISC} text-brand hover:bg-surface-brand`}
            >
              <IconComponent
                iconName={showInvite ? canvasIcon('hgi-user-add-02')! : canvasIcon('hgi-share-08')!}
                size={20}
                color="currentColor"
              />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`${DISC} text-danger transition-colors hover:bg-danger-surface`}
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isMembers ? (
            <BucketListMembersView bucketList={bucketList} />
          ) : (
            <div className="flex flex-col gap-[30px]">
              <div className="flex flex-col gap-4">
                {bucketList.description && (
                  <p className="text-base leading-relaxed text-gray-800">
                    {bucketList.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  {bucketList.owner && (
                    <button
                      type="button"
                      onClick={() => setView('members')}
                      aria-label={`${linkedUserName(bucketList.owner)}, owner of this list. See members`}
                      className="-ml-1.5 flex min-h-[52px] items-center gap-2.5 rounded-full py-1 pl-1.5 pr-4 hover:bg-surface"
                    >
                      <span className="relative block h-11 w-11 flex-shrink-0 overflow-hidden rounded-full bg-surface-brand">
                        <PhotoImage
                          src={bucketList.owner.picture}
                          alt={linkedUserName(bucketList.owner)}
                          fill
                          sizes="44px"
                          className="object-cover"
                          fallback={
                            <span className="flex h-full w-full items-center justify-center text-base font-bold text-brand">
                              {linkedUserName(bucketList.owner).charAt(0).toUpperCase()}
                            </span>
                          }
                        />
                      </span>
                      <span className="flex min-w-0 flex-col items-start gap-0.5">
                        <span className="whitespace-nowrap text-[15.5px] font-semibold text-gray-900">
                          {linkedUserName(bucketList.owner)}
                        </span>
                        <span className="whitespace-nowrap text-13 text-ink-muted">Owner</span>
                      </span>
                    </button>
                  )}

                  {acceptedMembers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setView('members')}
                      aria-label={`See members, ${bucketList.memberCount} members`}
                      className="flex h-12 items-center gap-2.5 rounded-full py-0 pl-1.5 pr-3.5 hover:bg-surface"
                    >
                      <span className="flex -space-x-2 pl-2">
                        {acceptedMembers.slice(0, 3).map((member) => (
                          <span
                            key={member.id}
                            className="relative block h-8 w-8 overflow-hidden rounded-full bg-surface-brand ring-2 ring-white"
                          >
                            <PhotoImage
                              src={member.user?.picture}
                              alt={linkedUserName(member.user)}
                              fill
                              sizes="32px"
                              className="object-cover"
                              fallback={
                                <span className="flex h-full w-full items-center justify-center text-[11px] font-bold text-brand">
                                  {linkedUserName(member.user).charAt(0).toUpperCase()}
                                </span>
                              }
                            />
                          </span>
                        ))}
                      </span>
                      <span className="whitespace-nowrap text-[14.5px] font-semibold text-brand">
                        {bucketList.memberCount}{' '}
                        {bucketList.memberCount === 1 ? 'member' : 'members'}
                      </span>
                    </button>
                  )}

                  <span className="inline-flex h-11 items-center gap-2 rounded-full bg-surface pl-4 pr-[18px] text-[15.5px] text-ink-muted">
                    <IconComponent
                      iconName={
                        isPublic ? canvasIcon('hgi-view')! : canvasIcon('hgi-view-off-slash')!
                      }
                      size={21}
                      color="currentColor"
                    />
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl bg-surface px-6 py-9 text-center">
                  <IconComponent
                    iconName={canvasIcon('hgi-shopping-basket-add-02')!}
                    size={40}
                    color="currentColor"
                    className="text-brand"
                  />
                  <span className="text-[17px] font-semibold text-gray-900">
                    {canAdd ? 'Nothing saved here yet' : 'Nothing on this list yet'}
                  </span>
                  <p className="max-w-[40ch] text-[15px] leading-relaxed text-ink-muted">
                    {canAdd
                      ? 'Tap the basket on any experience or place to add it to this list.'
                      : 'When the owner adds experiences and places, they show up here.'}
                  </p>

                  {canAdd && (
                    <div className="mt-1.5 flex flex-wrap justify-center gap-2.5">
                      <Button asChild variant="lime" className="h-12 rounded-full px-6 text-[15px]">
                        <Link href="/" onClick={onClose}>
                          Explore experiences
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="canvas-outline"
                        className="h-12 rounded-full px-[22px] text-[15px]"
                      >
                        <Link href="/places" onClick={onClose}>
                          Explore places
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {experiences.length > 0 && (
                    <section className="flex flex-col gap-4">
                      <h3 className="text-19 font-bold tracking-[-0.3px] text-gray-900">
                        Experiences
                      </h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                        {experiences.map((item) => (
                          <SavedExperienceCard key={item.id} item={item} onNavigate={onClose} />
                        ))}
                      </div>
                    </section>
                  )}

                  {places.length > 0 && (
                    <section className="flex flex-col gap-4">
                      <h3 className="text-19 font-bold tracking-[-0.3px] text-gray-900">Places</h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                        {places.map((item) => (
                          <SavedPlaceCard key={item.id} item={item} onNavigate={onClose} />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {!isMembers && (
          <footer className="sticky bottom-0 z-10 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
            {isOwner ? (
              <>
                <Button
                  variant="lime"
                  onClick={() => setIsEditOpen(true)}
                  className="h-12 rounded-full px-6 text-[15px]"
                >
                  <span className="flex items-center gap-2">
                    <IconComponent
                      iconName={canvasIcon('hgi-edit-04')!}
                      color="currentColor"
                      size={20}
                    />
                    Edit
                  </span>
                </Button>

                <button
                  type="button"
                  onClick={() => setConfirmKind('delete')}
                  className="flex h-12 items-center gap-2 px-1.5 text-[15px] font-medium text-gray-800 hover:underline"
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
                className="flex h-12 items-center gap-2 px-1.5 text-[15px] font-medium text-danger hover:underline"
              >
                <IconComponent
                  iconName={canvasIcon('hgi-logout-circle-02')!}
                  color="currentColor"
                  size={20}
                />
                Leave bucket list
              </button>
            ) : isPublic ? (
              <Button
                variant="lime"
                isLoading={isJoining}
                onClick={handleJoin}
                className="h-12 rounded-full px-6 text-[15px]"
              >
                <span className="flex items-center gap-2">
                  <IconComponent iconName="UserAdd02Icon" color="currentColor" size={20} />
                  Join bucket list
                </span>
              </Button>
            ) : null}
          </footer>
        )}
      </div>

      <CreateBucketListModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        bucketList={bucketList}
      />

      <AlertDialog
        open={Boolean(confirmKind)}
        onOpenChange={(open) => !open && setConfirmKind(null)}
      >
        <AlertDialogContent className="max-w-[420px] gap-[22px] rounded-[18px] p-6">
          {confirmCopy && (
            <>
              <AlertDialogHeader className="space-y-2 text-left sm:text-left">
                <AlertDialogTitle className="text-[21px] font-bold leading-tight tracking-[-0.3px] text-gray-900">
                  {confirmCopy.title}
                </AlertDialogTitle>
                <p className="text-[15px] leading-relaxed text-ink-muted">{confirmCopy.body}</p>
              </AlertDialogHeader>

              <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:gap-2 sm:space-x-0">
                <Button
                  variant="destructive"
                  isLoading={confirmKind === 'delete' ? isDeleting : isLeaving}
                  onClick={confirmKind === 'delete' ? handleDelete : handleLeave}
                  className="h-12 w-full rounded-full text-[15px]"
                >
                  {confirmCopy.confirmLabel}
                </Button>
                <button
                  type="button"
                  onClick={() => setConfirmKind(null)}
                  className="h-12 w-full rounded-full bg-surface text-[15px] font-semibold text-gray-900 hover:bg-surface-brand"
                >
                  {confirmCopy.cancelLabel}
                </button>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </Drawer>
  );
};
