'use client';

import { useEffect, useState } from 'react';

import { BucketListPanelFrame } from '@/app/shared/components/BucketList/BucketListDrawer/BucketListPanelFrame';
import {
  BucketListCreated,
  BucketListForm,
} from '@/app/shared/components/BucketList/BucketListForm';
import { useCreateBucketList, useUpdateBucketList } from '@/app/shared/hooks/useBucketLists';
import { useToast } from '@/app/shared/hooks/useToast';
import { Drawer } from '@/components/ui/drawer';
import { useBucketListDrawer } from '@/context/BucketListDrawerContext';
import { BucketList, CreateBucketListPayload } from '@/types/bucket-list';

interface CreatedList {
  id: string;
  name: string;
  visibility: 'public' | 'private';
}

interface CreateBucketListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Given one, the dialog edits it rather than making a new list */
  bucketList?: BucketList;
}

/**
 * Create or edit a list in a panel of its own, for the screens that are not
 * the bucket list panel - the full list page, and the picker's "new list".
 * The bucket list panel opens the same form as one of its own screens.
 */
export const CreateBucketListModal = ({
  open,
  onOpenChange,
  bucketList,
}: CreateBucketListModalProps) => {
  const isEditing = Boolean(bucketList);
  const { toast } = useToast();
  const drawer = useBucketListDrawer();

  // Set once creating succeeds - the panel then shows the success state
  // instead of the form. Stays null for editing, which closes on save instead.
  const [createdList, setCreatedList] = useState<CreatedList | null>(null);

  const { mutate: createBucketList, isPending: isCreating } = useCreateBucketList();
  const { mutate: updateBucketList, isPending: isUpdating } = useUpdateBucketList(
    bucketList?.id ?? '',
  );

  // Never the previous visit's success screen
  useEffect(() => {
    if (open) setCreatedList(null);
  }, [open]);

  const handleSubmit = (payload: CreateBucketListPayload) => {
    if (isEditing) {
      updateBucketList(payload, {
        onSuccess: () => {
          toast({ title: 'Changes saved.', variant: 'success' });
          onOpenChange(false);
        },
        onError: (error: Error) =>
          toast({
            title: 'Could not save this list',
            description: error.message,
            variant: 'destructive',
          }),
      });
      return;
    }

    createBucketList(payload, {
      onSuccess: (response) => {
        const created = response?.data as BucketList | undefined;
        setCreatedList({
          id: created?.id ?? '',
          name: payload.name,
          visibility: payload.visibility,
        });
      },
      onError: (error: Error) =>
        toast({
          title: 'Could not create this list',
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  const view = (created: CreatedList, then?: 'invite') => {
    onOpenChange(false);
    if (drawer) {
      drawer.openBucketList(created.id);
      if (then === 'invite') drawer.pushScreen({ kind: 'invite', id: created.id });
    } else {
      // Outside the app's providers there is no panel to open it in
      window.location.assign(`/bucket-lists/${created.id}`);
    }
  };

  const handleSecond = async (created: CreatedList) => {
    if (created.visibility === 'private') {
      view(created, 'invite');
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_APP_URL}/bucket-lists/${created.id}`,
      );
      toast({
        title: `Link copied. Anyone with it can view and join ${created.name}.`,
        variant: 'success',
      });
    } catch {
      // A denied clipboard is not worth an error dialog
    }
  };

  const close = () => onOpenChange(false);

  return (
    // The canvas opens everything about bucket lists in the side panel
    <Drawer isOpen={open} setIsOpen={onOpenChange} width="medium">
      <BucketListPanelFrame
        title={createdList ? '' : isEditing ? 'Edit bucket list' : 'Create bucket list'}
        ariaTitle="Bucket list created"
        onClose={close}
      >
        {createdList ? (
          <BucketListCreated
            name={createdList.name}
            visibility={createdList.visibility}
            onView={() => view(createdList)}
            onSecond={() => handleSecond(createdList)}
          />
        ) : (
          open && (
            <BucketListForm
              initial={bucketList}
              isEditing={isEditing}
              isPending={isCreating || isUpdating}
              onSubmit={handleSubmit}
              onCancel={close}
            />
          )
        )}
      </BucketListPanelFrame>
    </Drawer>
  );
};
