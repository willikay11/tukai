'use client';

import { useMemo, useState } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { CreateBucketListModal } from '@/app/(experiences)/experiences/components/CreateBucketListModal';
import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import { Share } from '@/app/shared/components/Share';
import { useBucketList, useDeleteBucketList } from '@/app/shared/hooks/useBucketLists';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { BucketListDetail, BucketListItem } from '@/types/bucket-list';
import { linkedUserName } from '@/types/user';

import { ReorderItemsDialog } from './components/ReorderItemsDialog';
import { SavedExperienceCard, SavedPlaceCard } from './components/SavedItemCard';

export const BucketListPageContent = ({ bucketListId }: { bucketListId: string }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const isSignedIn = Boolean(session?.user?.id);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);

  const { data: response, isLoading, isError } = useBucketList(bucketListId, isSignedIn);
  const bucketList: BucketListDetail | undefined = response?.data;

  const { mutate: deleteBucketList, isPending: isDeleting } = useDeleteBucketList();

  const items = useMemo(() => bucketList?.items ?? [], [bucketList]);

  // Shown in the order the owner set, which is the order the API returns
  const experiences = items.filter((item: BucketListItem) => item.experienceBookmark);
  const places = items.filter((item: BucketListItem) => item.placeBookmark);

  if (status === 'loading' || (isSignedIn && isLoading)) {
    return (
      <PageContainer className="py-6">
        <div className="h-8 w-48 animate-pulse rounded-full bg-gray-100" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-gray-100" />
      </PageContainer>
    );
  }

  if (!isSignedIn) {
    return (
      <PageContainer className="py-16 text-center">
        <p className="text-sm text-gray-500">Sign in to see your bucket lists.</p>
      </PageContainer>
    );
  }

  if (isError || !bucketList) {
    return (
      <PageContainer className="py-16 text-center">
        <p className="text-sm text-gray-500">
          This bucket list could not be opened. It may have been deleted, or it may not be shared
          with you.
        </p>
      </PageContainer>
    );
  }

  const isOwner = bucketList.owner?.id === session?.user?.id;
  const isPublic = bucketList.visibility === 'public';

  const handleDelete = () =>
    deleteBucketList(bucketList.id, {
      onSuccess: () => {
        toast({ title: `${bucketList.name} deleted`, variant: 'success' });
        router.push('/bucket-lists');
      },
      onError: (error: Error) =>
        toast({ title: 'Could not delete', description: error.message, variant: 'destructive' }),
    });

  const ownerActions = (
    <>
      <Button variant="lime" onClick={() => setIsEditOpen(true)} className="rounded-full">
        <span className="flex items-center gap-2">
          <IconComponent iconName="Edit02Icon" color="currentColor" size={16} />
          Edit
        </span>
      </Button>

      <Button
        variant="destructive"
        isLoading={isDeleting}
        onClick={handleDelete}
        className="rounded-full"
      >
        <span className="flex items-center gap-2">
          <IconComponent iconName="Delete02Icon" color="currentColor" size={16} />
          Delete
        </span>
      </Button>
    </>
  );

  return (
    // pb only where the actions float over the foot of the page
    <PageContainer className="py-6 pb-28 md:pb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/bucket-lists')}
            aria-label="Back to bucket lists"
            // Phones only: from md the app's own navigation is on screen
            className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-800 transition hover:bg-gray-200 md:hidden"
          >
            <IconComponent iconName="ArrowLeft01Icon" color="currentColor" size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{bucketList.name}</h1>
        </div>

        {/* From md the actions sit up here beside Share; on a phone there is
            no room for them, so they stay on the bar at the foot of the page */}
        <div className="flex items-center gap-2">
          {isOwner && <div className="hidden items-center gap-2 md:flex">{ownerActions}</div>}

          <Share
            coverPhoto={bucketList.coverImage ?? ''}
            title={bucketList.name}
            link={`${process.env.NEXT_PUBLIC_APP_URL}/bucket-lists/${bucketList.id}`}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700">
          <IconComponent
            iconName={isPublic ? 'Globe02Icon' : 'ViewOffIcon'}
            color="currentColor"
            size={16}
          />
          {isPublic ? 'Public' : 'Private'}
        </span>

        {/* The order things are saved in is the owner's to set, so this opens
            the reorder dialog rather than re-sorting the view */}
        {isOwner && items.length > 1 && (
          <button
            type="button"
            onClick={() => setIsReorderOpen(true)}
            aria-label="Reorder items"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
          >
            <IconComponent iconName="SortingAZ01Icon" color="currentColor" size={20} />
          </button>
        )}
      </div>

      <p className="mt-3 text-sm text-gray-500">{bucketList.description || 'Untagged saves'}</p>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-gray-50 py-16 text-center">
          <IconComponent iconName="ShoppingBasket01Icon" size={28} className="text-gray-300" />
          <p className="text-sm text-gray-500">
            {isOwner
              ? 'Nothing saved yet. Save an experience or a place and it lands here.'
              : 'Nothing has been saved to this list yet.'}
          </p>
        </div>
      ) : (
        <>
          {experiences.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-900">Saved Experiences</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {experiences.map((item) => (
                  <SavedExperienceCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {places.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-gray-900">Saved Places</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {places.map((item) => (
                  <SavedPlaceCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!isOwner && bucketList.owner && (
        <p className="mt-8 text-sm text-gray-400">by {linkedUserName(bucketList.owner)}</p>
      )}

      {/* Phones only — from md these live in the header */}
      {isOwner && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 md:hidden">
          <div className="flex items-center gap-2 rounded-full bg-white p-[5px] shadow-top-md">
            {ownerActions}
          </div>
        </div>
      )}

      <CreateBucketListModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        bucketList={bucketList}
      />

      {/* Reordering is over the list as saved, so it is not offered a view that
          has been re-sorted for reading */}
      <ReorderItemsDialog
        isOpen={isReorderOpen}
        setIsOpen={setIsReorderOpen}
        bucketListId={bucketList.id}
        items={items}
      />
    </PageContainer>
  );
};
