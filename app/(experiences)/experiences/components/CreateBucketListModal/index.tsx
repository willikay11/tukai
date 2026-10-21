'use client';

import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { useCreateBucketList, useUpdateBucketList } from '@/app/shared/hooks/useBucketLists';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { BucketList } from '@/types/bucket-list';

type Visibility = 'public' | 'private';

/** The round disc the header's close control sits in, same build as the
 * other drawers' (ExperienceDrawer, PlaceDrawer). */
const DISC = 'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface';

const NAME_MAX = 80;
const DESCRIPTION_MAX = 160;
// The counter only earns its place once space is actually running out
const DESCRIPTION_COUNTER_THRESHOLD = 130;

const VISIBILITY_OPTIONS: { value: Visibility; label: string; note: string }[] = [
  { value: 'public', label: 'Public', note: '(Everyone)' },
  { value: 'private', label: 'Private', note: '(Only invited people)' },
];

const VISIBILITY_HELP: Record<Visibility, string> = {
  public: 'Anyone can find it, view it and join. Joining never books anything.',
  private: 'Only people you invite can open it. A forwarded link grants nothing.',
};

// Shown in edit mode only, when the choice no longer matches what was saved
const VISIBILITY_CHANGE_WARNING: Record<Visibility, string> = {
  private:
    'Switching to Private takes it out of Discover. People who already joined keep access. Anyone new needs an invite.',
  public: 'Switching to Public means anyone can find, view and join it.',
};

const VisibilityToggle = ({
  value,
  onChange,
}: {
  value: Visibility;
  onChange: (value: Visibility) => void;
}) => (
  <div
    role="radiogroup"
    aria-labelledby="bucket-list-visibility-label"
    className="flex flex-wrap gap-2.5"
  >
    {VISIBILITY_OPTIONS.map((option) => {
      const checked = option.value === value;

      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={checked}
          onClick={() => onChange(option.value)}
          className={cn(
            'inline-flex h-[52px] items-center gap-1.5 whitespace-nowrap rounded-full px-[22px] text-[15.5px] font-medium transition-colors',
            checked
              ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white'
              : 'bg-surface text-gray-800 hover:bg-surface-brand',
          )}
        >
          {option.label}
          <span className={checked ? 'text-surface-brand' : 'text-ink-muted'}>{option.note}</span>
        </button>
      );
    })}
  </div>
);

interface CreatedList {
  id: string;
  name: string;
  visibility: Visibility;
}

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
  const { toast } = useToast();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(bucketList?.name ?? '');
  const [description, setDescription] = useState(bucketList?.description ?? '');
  const [visibility, setVisibility] = useState<Visibility>(bucketList?.visibility ?? 'public');
  // What the list was saved with, so edit mode can tell whether the reader
  // actually changed the visibility rather than just reopening on it
  const [savedVisibility, setSavedVisibility] = useState<Visibility>(
    bucketList?.visibility ?? 'public',
  );
  // Set once creating succeeds - the drawer then shows the success state
  // instead of the form. Stays null for editing, which closes on save instead.
  const [createdList, setCreatedList] = useState<CreatedList | null>(null);

  const { mutate: createBucketList, isPending: isCreating } = useCreateBucketList();
  const { mutate: updateBucketList, isPending: isUpdating } = useUpdateBucketList(
    bucketList?.id ?? '',
  );

  const isPending = isCreating || isUpdating;
  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  // Every time the drawer opens: blank for a new list, or the list's own
  // values for an edit - and never the previous visit's success screen
  useEffect(() => {
    if (!open) return;

    setCreatedList(null);
    setTitle(bucketList?.name ?? '');
    setDescription(bucketList?.description ?? '');
    setVisibility(bucketList?.visibility ?? 'public');
    setSavedVisibility(bucketList?.visibility ?? 'public');
  }, [open, bucketList]);

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    descriptionRef.current?.focus();
  };

  const handleSubmit = () => {
    const name = title.trim();
    const trimmedDescription = description.trim();
    if (!name || !trimmedDescription) return;

    const payload = { name, description: trimmedDescription, visibility };

    if (isEditing) {
      updateBucketList(payload, {
        onSuccess: () => {
          toast({ title: 'Changes saved.' });
          onOpenChange(false);
        },
        onError: (error: Error) =>
          toast({ title: 'Could not save this list', description: error.message, variant: 'destructive' }),
      });
      return;
    }

    createBucketList(payload, {
      onSuccess: (response) => {
        const created = response?.data as BucketList | undefined;
        setCreatedList({ id: created?.id ?? '', name, visibility });
      },
      onError: (error: Error) =>
        toast({ title: 'Could not create this list', description: error.message, variant: 'destructive' }),
    });
  };

  const handleCopyLink = async () => {
    if (!createdList) return;

    try {
      await navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_APP_URL}/bucket-lists/${createdList.id}`,
      );
      toast({ title: 'Link copied' });
    } catch {
      // A denied clipboard is not worth an error dialog
    }
  };

  return (
    // The canvas opens everything about bucket lists in the side panel
    <Drawer isOpen={open} setIsOpen={onOpenChange} width="medium">
      <div className="flex min-h-full flex-col">
        <div className="sticky top-0 z-10 flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted bg-white px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-2xl font-bold tracking-[-0.4px] text-gray-800">
            {createdList ? '' : isEditing ? 'Edit bucket list' : 'Create bucket list'}
          </h2>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Close"
            className={`${DISC} text-danger transition-colors hover:bg-danger-surface`}
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-9 pt-5">
          {createdList ? (
            <div className="flex flex-col items-center gap-4 pb-2 pt-3 text-center">
              <Image
                src="/images/bucket-list-success.png"
                alt=""
                width={220}
                height={220}
                className="h-[220px] w-[220px]"
              />

              <h2 className="text-[26px] font-bold leading-tight tracking-[-0.4px] text-gray-800">
                Your bucket list is ready
              </h2>

              <p className="max-w-[40ch] text-base leading-relaxed text-ink-muted">
                &ldquo;{createdList.name}&rdquo; is{' '}
                {createdList.visibility === 'public'
                  ? 'public. Anyone can find it, view it and join.'
                  : 'private. Only people you invite can open it.'}{' '}
                Tap the basket on any experience or place to add it.
              </p>

              <div className="mt-2.5 flex w-full max-w-[440px] flex-col gap-2.5">
                <Button asChild variant="lime" className="h-14 rounded-full px-[30px] text-base">
                  <Link href={`/bucket-lists/${createdList.id}`}>View bucket list</Link>
                </Button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-surface px-[30px] text-base font-semibold text-brand-ink transition-colors hover:bg-surface-brand"
                >
                  <IconComponent
                    iconName={createdList.visibility === 'public' ? 'Share08Icon' : 'UserAdd02Icon'}
                    size={21}
                    color="currentColor"
                    className="text-brand"
                  />
                  {createdList.visibility === 'public' ? 'Share link' : 'Invite members'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-[30px]">
              <div className="flex flex-col gap-3">
                <label htmlFor="bl-name" className="text-base font-semibold leading-[1.4] text-gray-800">
                  Bucket list name/title
                </label>
                <Input
                  id="bl-name"
                  placeholder="Enter bucket list name"
                  type="text"
                  maxLength={NAME_MAX}
                  value={title}
                  onKeyDown={handleNameKeyDown}
                  containerClassName="h-14 rounded-xl focus-within:shadow-[0_0_0_3px_#E8F1ED]"
                  suffixIcon={
                    <IconComponent iconName="ShoppingBasket02Icon" size={20} color="currentColor" />
                  }
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-3">
                <label
                  htmlFor="bl-desc"
                  className="text-base font-semibold leading-[1.4] text-gray-800"
                >
                  Bucket list description
                </label>
                <Textarea
                  id="bl-desc"
                  ref={descriptionRef}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add brief description about your bucket list"
                  rows={3}
                  maxLength={DESCRIPTION_MAX}
                  className="min-h-[136px] border-line focus-visible:border-brand-green focus-visible:shadow-[0_0_0_3px_#E8F1ED]"
                />
                {description.length >= DESCRIPTION_COUNTER_THRESHOLD && (
                  <span className="self-end text-13 text-ink-muted">
                    {description.length} / {DESCRIPTION_MAX}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3.5">
                <span id="bucket-list-visibility-label" className="text-base font-semibold leading-[1.4] text-gray-800">
                  Bucket list visibility{' '}
                  <span className="font-normal text-ink-muted">
                    (who can see or access this bucket list?)
                  </span>
                </span>

                <VisibilityToggle value={visibility} onChange={setVisibility} />

                <p className="text-sm leading-normal text-ink-muted">{VISIBILITY_HELP[visibility]}</p>

                {isEditing && visibility !== savedVisibility && (
                  <p className="rounded-xl bg-amber-100 px-4 py-3 text-[14.5px] leading-relaxed text-[#6B4200]">
                    {VISIBILITY_CHANGE_WARNING[visibility]}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="h-12 px-1.5 text-base font-medium text-danger hover:underline"
                >
                  Cancel
                </button>

                <Button
                  type="button"
                  variant="lime"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  isLoading={isPending}
                  className="h-14 rounded-full px-[30px] text-base disabled:bg-[#E4F4B5] disabled:text-[#5E7A45] disabled:opacity-100"
                >
                  {isEditing ? 'Save changes' : 'Create bucket list'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};
