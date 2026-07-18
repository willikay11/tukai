'use client';

import { useState } from 'react';

import { useCreateBucketList } from '@/app/shared/hooks/useBucketLists';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PillRadioGroup } from '@/components/ui/pillRadioGroup';

interface CreateBucketListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateBucketListModal = ({ open, onOpenChange }: CreateBucketListModalProps) => {
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [error, setError] = useState('');
  const { mutate: createBucketList, isPending } = useCreateBucketList();

  const handleCreate = () => {
    if (!title.trim()) {
      setError('Please enter a name for your bucket list.');
      return;
    }

    createBucketList(
      { title: title.trim(), isPublic: visibility === 'public' },
      {
        onSuccess: () => {
          setTitle('');
          setVisibility('public');
          setError('');
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="px-6 md:w-[24rem]">
        <div className="flex flex-col gap-4">
          <DialogTitle className="text-xl font-black text-gray-700">Create Bucket List</DialogTitle>
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
            <label className="text-xs font-medium text-gray-800">
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
            variant="gradient"
            onClick={handleCreate}
            disabled={isPending}
            className="w-full rounded-full"
          >
            {isPending ? 'Creating…' : 'Create Bucket List'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
