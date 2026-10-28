'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

type Visibility = 'everyone' | 'followers' | 'nobody';

type Draft = {
  profile: Visibility;
  showAttended: boolean;
  showComms: boolean;
  showLists: boolean;
};

/**
 * There is no account field anywhere for any of this (see
 * profile_page_backend_gaps.md) - every value below is a local default, not
 * a saved setting, and resets the moment the panel is reopened.
 */
const DEFAULT_DRAFT: Draft = {
  profile: 'everyone',
  showAttended: true,
  showComms: true,
  showLists: true,
};

const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: 'everyone', label: 'Everyone on Tukai' },
  { value: 'followers', label: 'People who follow you' },
  { value: 'nobody', label: 'Only you' },
];

const SWITCH_ROWS: { key: keyof Omit<Draft, 'profile'>; title: string; sub: string }[] = [
  { key: 'showAttended', title: 'Experiences you attended', sub: 'Shown on your profile calendar' },
  { key: 'showComms', title: 'Communities you joined', sub: 'Communities you run always show' },
  { key: 'showLists', title: 'Public bucket lists', sub: 'Private lists never show' },
];

const SwitchRow = ({
  title,
  sub,
  on,
  onClick,
}: {
  title: string;
  sub: string;
  on: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    onClick={onClick}
    className="-mx-3 flex min-h-16 items-center gap-3.5 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface"
  >
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-[15px] font-semibold text-gray-900">{title}</span>
      <span className="text-[13.5px] leading-[1.4] text-ink-muted">{sub}</span>
    </span>
    <span
      aria-hidden="true"
      className={cn('relative h-[30px] w-[52px] flex-shrink-0 rounded-full transition-colors', on ? 'bg-brand' : 'bg-line')}
    >
      <span
        className={cn(
          'absolute top-[3px] h-6 w-6 rounded-full bg-white shadow-[0_1px_3px_rgba(1,51,52,0.3)] transition-[left]',
          on ? 'left-[25px]' : 'left-[3px]',
        )}
      />
    </span>
  </button>
);

export const PrivacyDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { toast } = useToast();
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);

  const changed = JSON.stringify(draft) !== JSON.stringify(DEFAULT_DRAFT);

  const close = () => {
    setDraft(DEFAULT_DRAFT);
    onClose();
  };

  const submit = () => {
    toast({
      title: "Privacy settings aren't saved yet",
      description: 'There is nowhere on your account to store this choice yet - it resets next time you open this page.',
    });
    close();
  };

  return (
    <Drawer isOpen={isOpen} setIsOpen={(open) => !open && close()} ariaLabel="Privacy">
      <div className="flex min-h-full flex-col">
        <div className="flex h-[68px] flex-shrink-0 items-center gap-2 border-b border-surface-muted px-4">
          <h2 className="min-w-0 flex-1 truncate px-1.5 text-[24px] font-bold tracking-[-0.4px] text-gray-900">
            Privacy
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface text-danger transition-colors hover:bg-danger-surface"
          >
            <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-7 px-6 pb-9 pt-5">
          <div className="flex flex-col gap-2.5">
            <span id="pv-vis" className="text-[15px] font-semibold text-gray-900">
              Who can see your profile
            </span>
            <div role="radiogroup" aria-labelledby="pv-vis" className="flex flex-wrap gap-2.5">
              {VISIBILITY_OPTIONS.map((option) => {
                const on = draft.profile === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setDraft((current) => ({ ...current, profile: option.value }))}
                    className={cn(
                      'min-h-12 whitespace-nowrap rounded-full px-[22px] text-left text-[15px] font-medium active:scale-[0.98]',
                      on ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white' : 'bg-surface text-gray-900',
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-[15px] font-semibold text-gray-900">Show on your profile</span>
            <div className="flex flex-col">
              {SWITCH_ROWS.map((row) => (
                <SwitchRow
                  key={row.key}
                  title={row.title}
                  sub={row.sub}
                  on={draft[row.key]}
                  onClick={() => setDraft((current) => ({ ...current, [row.key]: !current[row.key] }))}
                />
              ))}
            </div>
          </div>

          <p className="flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-ink-note">
            <IconComponent
              iconName="SquareLock02Icon"
              size={18}
              color="currentColor"
              className="mt-px flex-shrink-0 text-brand"
            />
            <span>
              Your progress on a bucket list is always private, even on a public list. Private lists
              are invitation-only, and a forwarded link grants nothing.
            </span>
          </p>
        </div>

        <div className="sticky bottom-0 z-10 flex min-h-[88px] flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
          <button
            type="button"
            onClick={close}
            className="h-12 px-1.5 text-[15px] font-medium text-danger hover:underline"
          >
            Cancel
          </button>

          <span aria-hidden="true" className="flex-1" />

          <button
            type="button"
            onClick={submit}
            disabled={!changed}
            aria-disabled={!changed}
            className="h-12 whitespace-nowrap rounded-full bg-lime px-6 text-[15px] font-semibold text-brand-ink enabled:hover:bg-lime-dark disabled:bg-[#E4F4B5] disabled:text-[#5E7A45]"
          >
            Save changes
          </button>
        </div>
      </div>
    </Drawer>
  );
};
