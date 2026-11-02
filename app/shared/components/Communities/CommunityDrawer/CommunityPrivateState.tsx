'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Community, CommunityMember } from '@/types/community';
import { photoUrl } from '@/types/photo';
import { toPlainText } from '@/utils/safe-text-utils';

import { cityOf } from './community-drawer';

const GRADIENT_BUTTON =
  'h-12 whitespace-nowrap rounded-full bg-gradient-to-b from-brand-mid to-brand-deep px-[22px] text-[15px] font-semibold text-white hover:brightness-[1.04] active:scale-[0.97] disabled:opacity-60';

/**
 * A private community the reader has been invited to. Join makes them a
 * member and the drawer turns into the full view; Decline shows the closed
 * state.
 *
 * ⚠️ The API has no way for an invitee to decline - `leave` refuses an invite
 * never accepted, and `update-join-status` is the host's. Declining here only
 * hides the invite for this visit; the invite itself stays open.
 */
export const CommunityInvitedState = ({
  community,
  inviter,
  isJoining,
  onJoin,
  onDecline,
}: {
  community: Community;
  /** Who sent it. The membership record does not say, so the owner stands in. */
  inviter?: CommunityMember;
  isJoining: boolean;
  onJoin: () => void;
  onDecline: () => void;
}) => {
  const cover = photoUrl(community.photos?.[0], 'lg');
  const inviterName = inviter?.user?.displayName || inviter?.user?.firstName || 'Someone';
  const memberCount = community.membersCount ?? 0;
  const locality = cityOf(community);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-surface">
        {cover && <PhotoImage src={cover} alt="" fill sizes="640px" className="object-cover" />}
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-surface-brand p-[18px]">
        <span className="flex items-center gap-2 text-sm font-semibold text-brand-ink">
          <IconComponent
            iconName="Mail01Icon"
            size={18}
            color="currentColor"
            className="text-brand"
          />
          {inviterName} invited you to this private community
        </span>
        <p className="text-[15px] leading-[1.55] text-gray-800 [text-wrap:pretty]">
          {toPlainText(community.description)}
        </p>
        <span className="text-[13.5px] text-ink-muted">
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
          {locality ? `, ${locality}` : ''}
        </span>
        <p className="text-sm leading-normal text-ink [text-wrap:pretty]">
          Join to see its experiences, members and moments. Joining never books or pays for
          anything.
        </p>
        <div className="mt-1 flex flex-wrap gap-2.5">
          <button type="button" onClick={onJoin} disabled={isJoining} className={GRADIENT_BUTTON}>
            Join community
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="h-12 whitespace-nowrap rounded-full bg-white px-[22px] text-[15px] font-semibold text-brand-ink hover:bg-surface active:scale-[0.97]"
          >
            Decline invite
          </button>
        </div>
      </div>
    </div>
  );
};

/** Anyone else on a private community. A forwarded link grants nothing. */
export const CommunityClosedState = () => (
  <div className="flex flex-col items-center gap-3 rounded-xl bg-surface px-6 py-10 text-center">
    <IconComponent
      iconName="SquareLock02Icon"
      size={36}
      color="currentColor"
      className="text-brand"
    />
    <span className="text-lg font-semibold text-gray-800 [text-wrap:balance]">
      This community is private
    </span>
    <p className="max-w-[40ch] text-[15px] leading-[1.55] text-ink-muted [text-wrap:pretty]">
      Only people its owner invites can open it. A forwarded link grants nothing.
    </p>
  </div>
);
