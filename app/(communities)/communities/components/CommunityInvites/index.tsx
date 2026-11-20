'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import {
  useAcceptCommunityInvite,
  useCommunityInvites,
  useDeclineCommunityInvite,
} from '@/app/shared/hooks/useCommunities';
import { useToast } from '@/app/shared/hooks/useToast';
import { useCommunityDrawer } from '@/context/CommunityDrawerContext';
import { cn } from '@/lib/utils';
import { CommunityInvite } from '@/types/community';
import { coverPhotoUrl } from '@/types/photo';

const inviterOf = (community: CommunityInvite): string => {
  const by = community.invite?.invitedBy;
  return by?.displayName || [by?.firstName, by?.lastName].filter(Boolean).join(' ') || 'Someone';
};

const memberLine = (community: CommunityInvite) => {
  const count = community.membersCount ?? 0;
  return `${count} ${count === 1 ? 'member' : 'members'}`;
};

/** The two cover thumbnails, tilted, as the banner's art. */
const THUMBS = ['left-0 top-2.5 -rotate-[8deg]', 'left-[22px] top-0 rotate-[7deg]'];

const InviteRow = ({ community }: { community: CommunityInvite }) => {
  const { toast } = useToast();
  const drawer = useCommunityDrawer();
  const { mutate: accept, isPending: isAccepting } = useAcceptCommunityInvite();
  const { mutate: decline, isPending: isDeclining } = useDeclineCommunityInvite();
  const isBusy = isAccepting || isDeclining;
  const cover = coverPhotoUrl(community.photos, 'thumb');

  const onError = (title: string) => (error: Error) =>
    toast({ title, description: error.message, variant: 'destructive' });

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3.5 rounded-xl bg-white p-3">
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[10px] bg-surface">
        {cover && <PhotoImage src={cover} alt="" fill sizes="56px" className="object-cover" />}
      </div>
      <button
        type="button"
        onClick={() => drawer?.openCommunity(community.id)}
        className="flex min-h-11 min-w-0 flex-[1_1_160px] flex-col justify-center gap-[3px] text-left"
      >
        <span className="truncate text-[15px] font-semibold text-brand-ink">{community.title}</span>
        <span className="text-[13px] text-ink-muted">
          Invited by {inviterOf(community)}, {memberLine(community)}
        </span>
      </button>
      <div className="ml-auto flex flex-none gap-2">
        <button
          type="button"
          aria-label={`Decline the invite to ${community.title}`}
          disabled={isBusy}
          onClick={() =>
            decline(community.id, {
              onSuccess: () => toast({ description: `Invite to ${community.title} declined.` }),
              onError: onError('Could not decline'),
            })
          }
          className="h-11 rounded-full border border-line bg-white px-4 text-sm font-semibold text-gray-800 hover:bg-surface disabled:opacity-60"
        >
          Decline
        </button>
        <button
          type="button"
          aria-label={`Join ${community.title}`}
          disabled={isBusy}
          onClick={() =>
            accept(community.id, {
              onSuccess: () =>
                toast({
                  description: `You joined ${community.title}. Joining does not book or pay for anything.`,
                  variant: 'success',
                }),
              onError: onError('Could not join'),
            })
          }
          className="h-11 rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-5 text-sm font-semibold text-white active:scale-[0.98] disabled:opacity-60"
        >
          Join
        </button>
      </div>
    </div>
  );
};

/**
 * The invites the reader has not answered yet (DEV-380), above what they
 * follow: one collapsed banner that opens onto a Join and a Decline for each.
 * Hidden while there are none.
 */
export const CommunityInvites = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useCommunityInvites(true);
  const invites: CommunityInvite[] = data?.success ? (data.data?.results ?? []) : [];

  if (invites.length === 0) return null;

  const line =
    invites.length === 1
      ? `${inviterOf(invites[0])} invited you to join ${invites[0].title}.`
      : `You have been invited to join ${invites.length} communities.`;

  return (
    <div className="mt-7 overflow-hidden rounded-[18px] bg-lime-soft">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex min-h-[88px] w-full items-center gap-[18px] px-5 py-4 text-left hover:bg-lime-soft-hover"
      >
        <span aria-hidden="true" className="relative h-[60px] w-[72px] flex-none">
          {invites.slice(0, 2).map((community, index) => {
            const cover = coverPhotoUrl(community.photos, 'thumb');
            return (
              <span
                key={community.id}
                className={cn(
                  'absolute h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-surface shadow-[0_4px_12px_rgba(1,51,52,.18)]',
                  THUMBS[index],
                )}
              >
                {cover && (
                  <PhotoImage src={cover} alt="" fill sizes="48px" className="object-cover" />
                )}
              </span>
            );
          })}
        </span>
        <span className="flex min-w-0 flex-auto flex-col gap-1">
          <span className="text-[16.5px] font-semibold text-brand-ink">
            Community invites ({invites.length})
          </span>
          <span className="text-sm leading-[1.45] text-ink [text-wrap:pretty]">{line}</span>
        </span>
        <IconComponent
          iconName="ArrowDown01Icon"
          size={20}
          color="currentColor"
          className={cn('flex-none text-brand-ink transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,420px),1fr))] gap-2 px-3 pb-3">
          {invites.map((community) => (
            <InviteRow key={community.id} community={community} />
          ))}
        </div>
      )}
    </div>
  );
};
