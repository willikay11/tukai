'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { BucketListCard } from '@/app/(experiences)/experiences/components/BucketListCard';
import { CreateBucketListModal } from '@/app/(experiences)/experiences/components/CreateBucketListModal';
import { SharedBucketListCard } from '@/app/(experiences)/experiences/components/SharedBucketListCard';
import { IconComponent } from '@/app/shared/components/Icons';
import { PageContainer } from '@/app/shared/components/Layout';
import { isSharedWithMe, useMyBucketLists } from '@/app/shared/hooks/useBucketLists';
import { Button } from '@/components/ui/button';
import { BucketList } from '@/types/bucket-list';

/**
 * Every list the reader keeps, and the ones shared with them.
 *
 * The Saved tab on the experiences page shows the same thing beside bookmarks;
 * this is the page the profile menu opens, where lists are the whole subject.
 */
export const BucketListsPageContent = () => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const isSignedIn = Boolean(userId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: response, isLoading } = useMyBucketLists(isSignedIn);
  const all: BucketList[] = response?.data?.results ?? [];

  // One endpoint returns both; the owner is what tells them apart
  const mine = all.filter((list) => !isSharedWithMe(list, userId));
  const shared = all.filter((list) => isSharedWithMe(list, userId));

  if (status === 'loading') {
    return (
      <PageContainer className="py-6">
        <div className="h-8 w-48 animate-pulse rounded-full bg-gray-100" />
      </PageContainer>
    );
  }

  if (!isSignedIn) {
    return (
      <PageContainer className="py-16 text-center">
        <p className="text-sm text-gray-500">Sign in to keep bucket lists.</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bucket List</h1>
          <p className="mt-1 text-sm text-gray-500">
            The experiences and places you are saving for later.
          </p>
        </div>

        <Button
          variant="lime"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-full px-6 text-xs font-medium"
        >
          <span className="flex items-center gap-2">
            <IconComponent iconName="PlusSignIcon" color="currentColor" size={16} />
            New bucket list
          </span>
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[300px] animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          {mine.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-gray-50 py-16 text-center">
              <IconComponent iconName="ShoppingBasket01Icon" size={28} className="text-gray-300" />
              <p className="text-sm text-gray-500">
                No bucket lists yet. Start one and save the places you want to get to.
              </p>
              <Button
                variant="lime"
                onClick={() => setIsCreateOpen(true)}
                className="rounded-full px-6 text-xs font-medium"
              >
                Create your first bucket list
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mine.map((bucketList) => (
                <BucketListCard
                  key={bucketList.id}
                  bucketList={bucketList}
                  href={`/bucket-lists/${bucketList.id}`}
                />
              ))}
            </div>
          )}

          {shared.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-gray-900">Shared with you</h2>
              <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {shared.map((bucketList) => (
                  <SharedBucketListCard key={bucketList.id} bucketList={bucketList} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <CreateBucketListModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </PageContainer>
  );
};
