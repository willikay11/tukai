'use client';

import { useRef, useState } from 'react';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreateBucketListPayload } from '@/types/bucket-list';

type Visibility = 'public' | 'private';

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

const FIELD =
  'w-full rounded-xl border border-line bg-white text-[15px] text-gray-800 outline-none transition-[border-color,box-shadow] placeholder:text-ink-subtle focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]';

export const LIME_SUBMIT =
  'h-14 rounded-full px-[30px] text-base font-semibold hover:shadow-[0_6px_16px_rgba(176,232,0,.4)] active:scale-[.97] disabled:cursor-not-allowed disabled:bg-[#E4F4B5] disabled:text-[#5E7A45] disabled:opacity-100 disabled:shadow-none';

/**
 * Public or Private, as a radio group: one tab stop, with the arrow keys
 * moving the choice the way a native radio group does.
 */
const VisibilityToggle = ({
  value,
  onChange,
}: {
  value: Visibility;
  onChange: (value: Visibility) => void;
}) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;

    event.preventDefault();
    const next = (index + step + VISIBILITY_OPTIONS.length) % VISIBILITY_OPTIONS.length;
    onChange(VISIBILITY_OPTIONS[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-labelledby="bucket-list-visibility-label"
      className="flex flex-wrap gap-2.5"
    >
      {VISIBILITY_OPTIONS.map((option, index) => {
        const checked = option.value === value;

        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
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
};

/**
 * Create bucket list and Edit bucket list - the same form, with the
 * visibility warning only on Edit, once the choice moves off what was saved.
 */
export const BucketListForm = ({
  initial,
  isEditing = false,
  isPending = false,
  onSubmit,
  onCancel,
}: {
  initial?: { name?: string; description?: string; visibility?: Visibility };
  isEditing?: boolean;
  isPending?: boolean;
  onSubmit: (payload: CreateBucketListPayload) => void;
  onCancel: () => void;
}) => {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const savedVisibility = initial?.visibility ?? 'public';

  const [title, setTitle] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [visibility, setVisibility] = useState<Visibility>(savedVisibility);

  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    descriptionRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ name: title.trim(), description: description.trim(), visibility });
  };

  return (
    <div className="flex flex-col gap-[30px]">
      <div className="flex flex-col gap-3">
        <label htmlFor="bl-name" className="text-base font-semibold text-gray-800">
          Bucket list name/title
        </label>
        <div className="relative">
          <input
            id="bl-name"
            type="text"
            placeholder="Enter bucket list name"
            maxLength={NAME_MAX}
            value={title}
            onKeyDown={handleNameKeyDown}
            onChange={(event) => setTitle(event.target.value)}
            className={`${FIELD} h-14 pl-4 pr-[52px]`}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
          >
            <IconComponent iconName="ShoppingBasket02Icon" size={20} color="currentColor" />
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="bl-desc" className="text-base font-semibold text-gray-800">
          Bucket list description
        </label>
        <textarea
          id="bl-desc"
          ref={descriptionRef}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Add brief description about your bucket list"
          rows={3}
          maxLength={DESCRIPTION_MAX}
          className={`${FIELD} min-h-[136px] resize-y px-4 py-3.5 leading-normal`}
        />
        {description.length >= DESCRIPTION_COUNTER_THRESHOLD && (
          <span className="self-end text-13 text-ink-muted">
            {description.length} / {DESCRIPTION_MAX}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3.5">
        <span
          id="bucket-list-visibility-label"
          className="text-base font-semibold leading-[1.4] text-gray-800"
        >
          Bucket list visibility{' '}
          <span className="font-normal text-ink-muted">
            (who can see or access this bucket list?)
          </span>
        </span>

        <VisibilityToggle value={visibility} onChange={setVisibility} />

        <p className="text-sm leading-normal text-ink-muted [text-wrap:pretty]">
          {VISIBILITY_HELP[visibility]}
        </p>

        {isEditing && visibility !== savedVisibility && (
          <p className="rounded-xl bg-amber-100 px-4 py-3 text-[14.5px] leading-normal text-[#6B4200]">
            {VISIBILITY_CHANGE_WARNING[visibility]}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="h-12 px-1.5 text-base font-medium text-danger hover:underline"
        >
          Cancel
        </button>

        <Button
          type="button"
          variant="lime"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
          isLoading={isPending}
          className={LIME_SUBMIT}
        >
          {isEditing ? 'Save changes' : 'Create bucket list'}
        </Button>
      </div>
    </div>
  );
};

/** "Your bucket list is ready" - what Create turns into once the list exists. */
export const BucketListCreated = ({
  name,
  visibility,
  onView,
  onSecond,
}: {
  name: string;
  visibility: Visibility;
  onView: () => void;
  /** Share link on a public list, Invite members on a private one. */
  onSecond: () => void;
}) => {
  const isPublic = visibility === 'public';

  return (
    <div className="flex flex-col items-center gap-4 pb-2 pt-3 text-center">
      <Image
        src="/images/bucket-list-success.png"
        alt=""
        width={220}
        height={220}
        className="h-[220px] w-[220px]"
      />

      <h2 className="text-[26px] font-bold leading-[1.2] tracking-[-0.4px] text-gray-800 [text-wrap:balance]">
        Your bucket list is ready
      </h2>

      <p className="max-w-[40ch] text-base leading-[1.55] text-ink-muted [text-wrap:pretty]">
        &ldquo;{name}&rdquo; is{' '}
        {isPublic
          ? 'public. Anyone can find it, view it and join.'
          : 'private. Only people you invite can open it.'}{' '}
        Tap the basket on any experience or place to add it.
      </p>

      <div className="mt-2.5 flex w-full max-w-[440px] flex-col gap-2.5">
        <Button
          type="button"
          variant="lime"
          onClick={onView}
          className="h-14 rounded-full text-base font-semibold hover:shadow-[0_6px_16px_rgba(176,232,0,.4)] active:scale-[.97]"
        >
          View bucket list
        </Button>

        <button
          type="button"
          onClick={onSecond}
          className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-surface text-base font-semibold text-brand-ink transition-colors hover:bg-surface-brand"
        >
          <IconComponent
            iconName={isPublic ? 'Share08Icon' : 'UserAdd02Icon'}
            size={21}
            color="currentColor"
            className="text-brand"
          />
          {isPublic ? 'Share link' : 'Invite members'}
        </button>
      </div>
    </div>
  );
};
