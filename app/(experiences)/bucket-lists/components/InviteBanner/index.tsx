'use client';

import { PhotoImage } from '@/app/shared/components/Images';
import {
  useAcceptBucketListInvite,
  useBucketList,
  useDeclineBucketListInvite,
  useMyBucketListMembership,
} from '@/app/shared/hooks/useBucketLists';
import { useToast } from '@/app/shared/hooks/useToast';
import { Button } from '@/components/ui/button';
import { BucketListDetail, BucketListMember } from '@/types/bucket-list';
import { linkedUserName } from '@/types/user';

/** "Private list, 3 ideas" - the expiry is not something the API sends. */
export const inviteNote = (bucketList?: Pick<BucketListDetail, 'itemCount'>) => {
  if (bucketList?.itemCount === undefined) return 'Private list';
  const ideas = bucketList.itemCount;

  return `Private list, ${ideas} ${ideas === 1 ? 'idea' : 'ideas'}`;
};

/**
 * An invite to a private list, waiting on the Following tab.
 *
 * Reached from the invite's own link, `/bucket-lists?invite={listId}`: the
 * API has no "my invites" collection, so the banner asks after the reader's
 * membership of that one list, and shows only while it is pending. The list
 * itself may not open until the invite is accepted, so its name is a bonus.
 */
export const InviteBanner = ({
  bucketListId,
  onAccepted,
  onDismissed,
}: {
  bucketListId: string;
  onAccepted: () => void;
  onDismissed: () => void;
}) => {
  const { toast } = useToast();

  const { data: membershipResponse } = useMyBucketListMembership(bucketListId);
  const membership: BucketListMember | undefined = membershipResponse?.data;
  const isPending = membership?.status === 'pending';

  const { data: listResponse } = useBucketList(bucketListId, isPending);
  const bucketList: BucketListDetail | undefined = listResponse?.data;

  const { mutate: accept, isPending: isAccepting } = useAcceptBucketListInvite();
  const { mutate: decline, isPending: isDeclining } = useDeclineBucketListInvite();

  if (!isPending) return null;

  const inviter = membership.invitedBy ?? bucketList?.owner;
  const inviterFirst = inviter?.firstName?.trim() || linkedUserName(inviter).split(' ')[0];
  const listName = bucketList?.name ?? 'a private bucket list';

  const handleAccept = () =>
    accept(bucketListId, {
      onSuccess: () => {
        toast({
          title: `Invitation accepted. ${bucketList?.name ?? 'The list'} is in Following.`,
          variant: 'success',
        });
        onAccepted();
      },
      onError: (error: Error) =>
        toast({ title: 'Could not accept', description: error.message, variant: 'destructive' }),
    });

  const handleDecline = () =>
    decline(bucketListId, {
      onSuccess: () => {
        toast({
          title: 'Invitation declined. The list stays private and you keep no access.',
          variant: 'success',
        });
        onDismissed();
      },
      onError: (error: Error) =>
        toast({ title: 'Could not decline', description: error.message, variant: 'destructive' }),
    });

  return (
    <div className="mt-7 flex flex-wrap items-center gap-3.5 rounded-xl bg-surface-brand p-4">
      <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-white">
        <PhotoImage
          src={inviter?.picture ?? undefined}
          alt=""
          fill
          sizes="48px"
          className="object-cover"
        />
      </span>

      <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-0.5">
        <p className="text-[15.5px] font-semibold leading-[1.35] text-brand-ink [text-wrap:pretty]">
          {inviterFirst} invited you to {listName}
        </p>
        <p className="text-[13.5px] text-ink">{inviteNote(bucketList)}</p>
      </div>

      <div className="flex flex-shrink-0 gap-2">
        <Button
          type="button"
          onClick={handleDecline}
          isLoading={isDeclining}
          disabled={isAccepting}
          className="h-11 rounded-full bg-white px-[18px] text-[14.5px] font-semibold text-gray-800 hover:bg-surface"
        >
          Decline
        </Button>
        <Button
          type="button"
          onClick={handleAccept}
          isLoading={isAccepting}
          disabled={isDeclining}
          className="h-11 rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-5 text-[14.5px] font-semibold text-white active:scale-[.98]"
        >
          Accept
        </Button>
      </div>
    </div>
  );
};
