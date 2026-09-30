'use client';

import { useState } from 'react';

import { CreateBucketListModal } from '@/app/(experiences)/experiences/components/CreateBucketListModal';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { ROW_HOVER } from '@/app/shared/components/Motion';
import { useAddBucketListItem, useMyBucketLists } from '@/app/shared/hooks/useBucketLists';
import { useToast } from '@/app/shared/hooks/useToast';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { BucketList, bucketListCoverPhoto } from '@/types/bucket-list';

/**
 * Which list to save this onto.
 *
 * Saving is a two-step choice — the reader picks the list, then it goes on —
 * so this asks rather than toggling. A reader with no lists can make one
 * without leaving it.
 *
 * Opens in the shared Drawer, which is the canvas's rule for bucket lists:
 * everything about them opens in the side panel. It was on a Radix dialog
 * because the old Drawer positioned itself with `fixed` and no portal, so any
 * ancestor carrying a transform or a backdrop-filter became its containing
 * block and it landed somewhere other than the viewport. The Drawer portals
 * now, so that reason is gone.
 */
export const BucketListPicker = ({
  isOpen,
  setIsOpen,
  experienceId,
  placeId,
  itemName,
  onSaved,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  experienceId?: string;
  placeId?: string;
  /** Named in the confirmation, so the reader knows what went where */
  itemName?: string;
  /** Told once something actually landed on a list */
  onSaved?: () => void;
}) => {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [savingTo, setSavingTo] = useState<string | null>(null);

  const { data: response, isLoading } = useMyBucketLists(isOpen);
  const bucketLists: BucketList[] = response?.data?.results ?? [];

  // The list is chosen in the sheet, so the mutation is keyed to it as it fires
  const { mutate: addItem } = useAddBucketListItem(savingTo ?? '');

  const handlePick = (bucketList: BucketList) => {
    setSavingTo(bucketList.id);

    addItem(
      { experienceId, placeId },
      {
        onSuccess: () => {
          setSavingTo(null);
          setIsOpen(false);
          onSaved?.();
          toast({
            title: `Saved to ${bucketList.name}`,
            description: itemName ? `${itemName} is on your list.` : undefined,
            variant: 'success',
          });
        },
        onError: (error: Error) => {
          setSavingTo(null);
          toast({
            title: 'Could not save this',
            description: error.message,
            variant: 'destructive',
          });
        },
      },
    );
  };

  return (
    <>
      <Drawer isOpen={isOpen} setIsOpen={setIsOpen} width="narrow">
        <div className="p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-gray-900">Your Bucket Lists</h2>
            <span className="sr-only">Choose which bucket list to save this to</span>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary"
            >
              <IconComponent iconName="ShoppingBasket01Icon" color="currentColor" size={16} />
              Create New Bucket List
            </button>
          </div>

          {isLoading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : bucketLists.length === 0 ? (
            <p className="mt-6 rounded-2xl bg-gray-50 p-4 text-center text-xs text-gray-500">
              No bucket lists yet. Create one and this will be its first save.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-gray-100">
              {bucketLists.map((bucketList) => {
                const isSaving = savingTo === bucketList.id;

                return (
                  <li key={bucketList.id}>
                    <button
                      type="button"
                      onClick={() => handlePick(bucketList)}
                      disabled={Boolean(savingTo)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left disabled:opacity-60',
                        ROW_HOVER,
                      )}
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <PhotoImage
                          src={bucketListCoverPhoto(bucketList)}
                          alt={bucketList.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {bucketList.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {bucketList.visibility === 'public' ? 'Public' : 'Private'} ·{' '}
                          {bucketList.memberCount}{' '}
                          {bucketList.memberCount === 1 ? 'Member' : 'Members'}
                        </p>
                      </div>

                      {/* The radio reads as a choice; it fills in as the save runs */}
                      <span
                        aria-hidden
                        className={cn(
                          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2',
                          isSaving ? 'border-primary bg-primary' : 'border-gray-200',
                        )}
                      >
                        {isSaving && (
                          <IconComponent iconName="Tick02Icon" color="#FFFFFF" size={14} />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Drawer>

      <CreateBucketListModal open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
};
