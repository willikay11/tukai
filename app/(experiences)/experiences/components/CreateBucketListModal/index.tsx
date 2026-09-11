'use client';

import { useEffect, useState } from 'react';

import { useCreateBucketList, useUpdateBucketList } from '@/app/shared/hooks/useBucketLists';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';
import { BucketList } from '@/types/bucket-list';

interface CreateBucketListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Given one, the dialog edits it rather than making a new list */
  bucketList?: BucketList;
}

export const CreateBucketListModal = ({
  open,
  onOpenChange,
  bucketList,
}: CreateBucketListModalProps) => {
  const isEditing = Boolean(bucketList);

  const [title, setTitle] = useState(bucketList?.name ?? '');
  const [visibility, setVisibility] = useState<'public' | 'private'>(
    bucketList?.visibility ?? 'public',
  );
  const [error, setError] = useState('');

  const { mutate: createBucketList, isPending: isCreating } = useCreateBucketList();
  const { mutate: updateBucketList, isPending: isUpdating } = useUpdateBucketList(
    bucketList?.id ?? '',
  );

  const isPending = isCreating || isUpdating;

  // Reopening on a different list, or after a rename elsewhere, starts from
  // what that list is called now rather than what it was at first mount
  useEffect(() => {
    if (!open || !bucketList) return;

    setTitle(bucketList.name);
    setVisibility(bucketList.visibility);
    setError('');
  }, [open, bucketList]);

  const handleCreate = () => {
    if (!title.trim()) {
      setError('Please enter a name for your bucket list.');
      return;
    }

    const payload = { name: title.trim(), visibility };

    const onSuccess = () => {
      if (!isEditing) {
        setTitle('');
        setVisibility('public');
      }
      setError('');
      onOpenChange(false);
    };

    if (isEditing) updateBucketList(payload, { onSuccess });
    else createBucketList(payload, { onSuccess });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="px-6 md:w-[24rem]">
        <div className="flex flex-col gap-4">
          <DialogTitle className="text-xl font-black text-gray-700">
            {isEditing ? 'Edit Bucket List' : 'Create Bucket List'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Name your bucket list and choose who can see it
          </DialogDescription>

          <div>
            <Input
              placeholder="Bucket list name e.g. Weekend Hikes"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-800">
              Visibility (who can see this bucket list)
            </label>
            <div className="w-fit">
              <PillRadioGroup
                options={[
                  { value: 'public', label: 'Public' },
                  { value: 'private', label: 'Private' },
                ]}
                value={visibility}
                onChange={(value) => setVisibility(value as 'public' | 'private')}
              />
            </div>
          </div>

          <Button
            variant="lime"
            onClick={handleCreate}
            className="w-full rounded-full"
            isLoading={isPending}
          >
            {isEditing ? 'Save Changes' : 'Create Bucket List'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
