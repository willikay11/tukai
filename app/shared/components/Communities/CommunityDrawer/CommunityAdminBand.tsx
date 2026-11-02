'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { SendMessage } from '@/app/shared/components/SendMessage';
import { useToast } from '@/app/shared/hooks/useToast';
import { CommunityMember } from '@/types/community';

import { nameOfMember } from './community-drawer';
import { Avatar } from './parts';

/** Owners write to every member - there is no endpoint for that yet. */
export const MESSAGE_MEMBERS_UNAVAILABLE = "Messaging all members isn't available yet.";

/**
 * The Admin band: the community's owner, how much they have organised, and a
 * way to write to them - or, on the reader's own community, to its members.
 */
export const CommunityAdminBand = ({
  owner,
  isOwnerSelf,
  pastExperiences,
}: {
  owner?: CommunityMember;
  isOwnerSelf: boolean;
  pastExperiences: number;
}) => {
  const { toast } = useToast();
  const [isMessageOpen, setIsMessageOpen] = useState(false);

  if (!owner) return null;

  const ownerName = nameOfMember(owner);
  const name = isOwnerSelf ? 'You' : ownerName;

  return (
    <div className="-mx-6 -mt-2 flex flex-wrap items-center gap-3.5 bg-surface px-6 py-4">
      <Avatar src={owner.user?.picture} name={ownerName} size={52} />

      <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.5">
        <button
          type="button"
          onClick={() =>
            toast({
              description: isOwnerSelf ? 'Opens your profile.' : `Opens ${ownerName}'s profile.`,
            })
          }
          className="-mb-2 -mt-2.5 inline-flex min-h-11 max-w-full items-center gap-1.5 self-start text-left text-[15px] text-gray-800 transition-colors hover:text-brand"
        >
          <span className="text-ink-muted">Admin:</span>
          <span className="min-w-0 truncate font-semibold">{name}</span>
          {/* ⚠️ Every admin gets the badge, as the handoff draws it - its Open
              item 1 asks whether it should mean a verified person */}
          <span role="img" aria-label="Verified" className="flex-shrink-0">
            <IconComponent
              iconName="CheckmarkBadge01Icon"
              variant="bulk"
              size={18}
              color="currentColor"
              className="text-brand"
            />
          </span>
          <IconComponent
            iconName="ArrowUpRight01Icon"
            size={16}
            color="currentColor"
            className="flex-shrink-0 text-brand"
          />
        </button>
        {pastExperiences > 0 && (
          <span className="text-[13.5px] text-ink-muted">
            {pastExperiences} past {pastExperiences === 1 ? 'experience' : 'experiences'} organised
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() =>
          isOwnerSelf ? toast({ description: MESSAGE_MEMBERS_UNAVAILABLE }) : setIsMessageOpen(true)
        }
        className="inline-flex h-12 flex-none items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-5 text-[14.5px] font-bold text-white active:scale-[0.98]"
      >
        <IconComponent iconName="BubbleChatIcon" size={18} color="currentColor" />
        {isOwnerSelf ? 'Message members' : 'Message host'}
      </button>

      {!isOwnerSelf && owner.user?.id && (
        <SendMessage open={isMessageOpen} setOpen={setIsMessageOpen} recipientId={owner.user.id} />
      )}
    </div>
  );
};
