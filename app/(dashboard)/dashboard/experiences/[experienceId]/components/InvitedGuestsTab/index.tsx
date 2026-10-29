'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { useRemoveExperienceGuest } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';

import { InviteChip, emptyLine, guestChip, matchesQuery } from './guest-list';

interface InvitedGuestsTabProps {
  experienceId: string;
  guests: Experience['guests'];
  communities?: Experience['communities'];
}

type GuestsView = 'guests' | 'communities';

/**
 * One invited guest or community.
 *
 * `onRemove` is left off for a community: the API takes communities on write
 * only, so there is no endpoint to un-share with one.
 */
const InviteChipPill = ({
  chip,
  onRemove,
  isRemoving,
}: {
  chip: InviteChip;
  onRemove?: () => void;
  isRemoving?: boolean;
}) => (
  <span className="inline-flex h-[52px] max-w-full items-center gap-2 rounded-full bg-surface pl-1.5 pr-0.5">
    {chip.image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={chip.image}
        alt=""
        className="h-10 w-10 flex-shrink-0 rounded-full bg-surface-brand object-cover"
      />
    ) : (
      <span
        aria-hidden="true"
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-line text-15 font-semibold text-ink"
      >
        {chip.initial}
      </span>
    )}

    <span className="min-w-0 max-w-[200px] truncate text-15 text-gray-900">{chip.label}</span>

    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoving}
        aria-label={`Remove ${chip.removeLabel}`}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:text-gray-900 disabled:opacity-50"
      >
        <IconComponent iconName="CancelCircleIcon" size={22} color="currentColor" />
      </button>
    )}
  </span>
);

export const InvitedGuestsTab = ({
  experienceId,
  guests,
  communities = [],
}: InvitedGuestsTabProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const [view, setView] = useState<GuestsView>('guests');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const { mutate: removeGuest, isPending, variables } = useRemoveExperienceGuest(experienceId);

  const communityChips: InviteChip[] = useMemo(
    () =>
      communities.map((community) => ({
        id: community.id,
        label: community.title,
        initial: community.title?.charAt(0)?.toUpperCase() ?? '?',
        image: coverPhotoUrl(community.photos, 'thumb'),
        removeLabel: community.title,
      })),
    [communities],
  );

  const guestChips = useMemo(() => guests.map(guestChip), [guests]);

  const chips = (view === 'guests' ? guestChips : communityChips).filter((chip) =>
    matchesQuery(chip, query),
  );

  const remove = (chip: InviteChip) =>
    removeGuest(chip.id, {
      onSuccess: () =>
        toast({
          // The canvas says both halves of this: they are off the list, and
          // what that means for the invite they were sent
          title: `${chip.removeLabel} is off the guest list`,
          description: 'Their invite no longer works.',
          variant: 'success',
        }),
      onError: (error: Error) =>
        toast({
          title: 'Could not remove this guest',
          description: error.message,
          variant: 'destructive',
        }),
    });

  const views: Array<{ id: GuestsView; label: string }> = [
    { id: 'guests', label: `Guests (${guests.length})` },
    { id: 'communities', label: `Communities (${communities.length})` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          role="tablist"
          aria-label="Invited"
          className="inline-flex items-center gap-1 rounded-full bg-surface p-1"
        >
          {views.map((option) => {
            const isActive = view === option.id;

            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setView(option.id)}
                className={cn(
                  'h-11 flex-shrink-0 rounded-full px-[18px] text-15 font-medium transition-colors',
                  isActive ? 'bg-emerald-200 text-brand-deep' : 'text-gray-900 hover:bg-white/60',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsSearchOpen((open) => !open)}
          aria-label="Search invited guests"
          aria-expanded={isSearchOpen}
          className="ml-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-surface text-gray-900 transition-colors hover:bg-surface-brand"
        >
          <IconComponent iconName="Search01Icon" size={21} color="currentColor" />
        </button>
      </div>

      {isSearchOpen && (
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search invited guests"
          placeholder="Search by name or email"
          className="h-[52px] w-full rounded-14 border-[1.5px] border-line bg-white px-[18px] text-15 text-gray-900 outline-none focus:border-brand"
        />
      )}

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <InviteChipPill
              key={chip.id}
              chip={chip}
              // Communities are write-only on the API; there is nothing to call
              onRemove={view === 'guests' ? () => remove(chip) : undefined}
              isRemoving={isPending && variables === chip.id}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-14 bg-surface px-5 py-6 text-center text-15 leading-relaxed text-ink">
          {emptyLine(view, query)}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
        <Button
          type="button"
          variant="gradient"
          onClick={() =>
            router.push(`/experiences/create?experienceId=${experienceId}&step=guests`)
          }
          className="rounded-full px-5"
        >
          Invite More Guests
        </Button>

        <Button
          type="button"
          variant="lime"
          disabled
          title="Resending invites is not available yet"
          className="rounded-full px-5"
        >
          Resend Invites
        </Button>
      </div>
    </div>
  );
};
