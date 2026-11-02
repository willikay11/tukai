'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import {
  useBucketList,
  useBucketListMembers,
  useRemoveBucketListMember,
} from '@/app/shared/hooks/useBucketLists';
import { useToast } from '@/app/shared/hooks/useToast';
import { BucketListDetail, BucketListMember } from '@/types/bucket-list';
import { canvasIcon } from '@/utils/canvas-icons';

import { BucketListConfirmDialog } from './BucketListConfirmDialog';
import { BucketListFace } from './BucketListFace';
import { BucketListPanelFrame } from './BucketListPanelFrame';
import { BucketListUnavailable, useCopyBucketListLink } from './BucketListView';
import {
  BucketListNav,
  RosterPerson,
  bucketListConfirmCopy,
  bucketListConfirmDoneToast,
  bucketListRoster,
  filterRoster,
  rosterCountLine,
} from './bucket-list-drawer';

export const SEARCH_INPUT =
  'h-14 w-full rounded-xl border border-line bg-white text-[15px] text-gray-800 outline-none transition-[border-color,box-shadow] placeholder:text-ink-subtle focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]';

/**
 * Who is on a list - the owner button and the members button both open this,
 * on top of the list.
 *
 * The owner sees pending invites too, and a More button on everyone else that
 * removes them or cancels their invite. Everyone else sees who has accepted.
 */
export const BucketListMembersView = ({
  bucketListId,
  nav,
}: {
  bucketListId: string;
  nav: BucketListNav;
}) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { toast } = useToast();
  const copyLink = useCopyBucketListLink();

  const [query, setQuery] = useState('');
  const [asking, setAsking] = useState<RosterPerson | null>(null);

  const { data: response, error } = useBucketList(bucketListId);
  const bucketList: BucketListDetail | undefined = response?.data;
  const isOwner = Boolean(userId) && bucketList?.owner?.id === userId;

  const { data: membersResponse } = useBucketListMembers(bucketListId, isOwner);
  const ownerMembers: BucketListMember[] | undefined = Array.isArray(membersResponse?.data)
    ? membersResponse.data
    : membersResponse?.data?.results;

  const { mutate: removeMember, isPending: isRemoving } = useRemoveBucketListMember(bucketListId);

  if (!bucketList) {
    return (
      <BucketListPanelFrame title="Members" onBack={nav.back} onClose={nav.close}>
        {error ? <BucketListUnavailable status={(error as { status?: number }).status} /> : null}
      </BucketListPanelFrame>
    );
  }

  const isPublic = bucketList.visibility === 'public';
  const roster = bucketListRoster(bucketList, isOwner ? ownerMembers : undefined, userId);
  const shown = filterRoster(roster, query);
  const askKind = asking?.isPending ? 'cancel-invite' : 'remove';

  const handleConfirm = () => {
    if (!asking) return;
    const done = bucketListConfirmDoneToast(askKind, bucketList, asking.name);

    removeMember(asking.user.id, {
      onSuccess: () => {
        setAsking(null);
        toast({ title: done, variant: 'success' });
      },
      onError: (failure: Error) =>
        toast({ title: 'Could not do that', description: failure.message, variant: 'destructive' }),
    });
  };

  return (
    <BucketListPanelFrame
      title="Members"
      onBack={nav.back}
      onShare={() =>
        copyLink(
          bucketList.id,
          isPublic
            ? 'Link copied. Anyone with it can view and join this list.'
            : 'Member link copied. Only people on this list can open it.',
        )
      }
      onClose={nav.close}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <label htmlFor="bl-mq" className="text-base text-gray-800">
            Find members
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
              <IconComponent iconName="UserIcon" size={20} color="currentColor" />
            </span>
            <input
              id="bl-mq"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by user name or email"
              className={`${SEARCH_INPUT} pl-12 pr-[52px]`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted">
              <IconComponent iconName="Search01Icon" size={20} color="currentColor" />
            </span>
          </div>
          <span className="text-[15.5px] text-ink-muted">{rosterCountLine(roster)}</span>
        </div>

        {shown.length === 0 ? (
          <p className="text-[15px] text-ink-muted">
            No one on this list matches &ldquo;{query.trim()}&rdquo;
          </p>
        ) : (
          <ul className="-mt-1 grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-x-3.5 gap-y-[26px]">
            {shown.map((person) => (
              <li
                key={`${person.user.id}-${person.isPending ? 'invite' : 'member'}`}
                className="flex min-w-0 flex-col items-center gap-2 text-center"
              >
                <BucketListFace
                  user={person.user}
                  className="aspect-square h-auto w-full max-w-[112px]"
                  initialClassName="text-[32px] font-semibold"
                  sizes="112px"
                />
                <span className="max-w-full text-[15.5px] leading-[1.3] text-gray-800 [overflow-wrap:anywhere] [text-wrap:balance]">
                  {person.name}
                </span>
                {person.caption && (
                  <span className="-mt-1 text-13 font-semibold text-brand">{person.caption}</span>
                )}
                {isOwner && !person.isSelf && !person.caption.startsWith('Owner') && (
                  <button
                    type="button"
                    onClick={() => setAsking(person)}
                    aria-label={`${person.isPending ? 'Invite' : 'Member'} options for ${person.name}`}
                    className="-mt-2.5 flex h-11 w-11 items-center justify-center rounded-full text-gray-800 transition-colors hover:bg-surface"
                  >
                    <IconComponent
                      iconName={canvasIcon('hgi-more-horizontal')!}
                      size={24}
                      color="currentColor"
                    />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <BucketListConfirmDialog
        copy={asking ? bucketListConfirmCopy(askKind, bucketList, asking.name) : null}
        photo={asking ? (asking.user.picture ?? null) : undefined}
        isPending={isRemoving}
        onConfirm={handleConfirm}
        onCancel={() => setAsking(null)}
      />
    </BucketListPanelFrame>
  );
};
