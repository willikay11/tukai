'use client';

import { CommunityCard } from '@/app/shared/components/Communities/CommunityCard';
import { IconComponent } from '@/app/shared/components/Icons';
import { useShowMore } from '@/app/shared/hooks/useShowMore';
import { cn } from '@/lib/utils';
import { Community } from '@/types/community';

import { COMMUNITY_GRID } from '../grid';

const VISIBLE = 4;

/** Fewer than this many friends in it reads as chance, not a pull - the design's cut-off. */
export const MIN_FRIENDS = 2;

/** The communities at least two people the reader follows joined, most friends first. */
export const friendsJoined = (communities: Community[]): Community[] =>
  communities
    .filter((community) => (community.friendsCount ?? 0) >= MIN_FRIENDS)
    .sort(
      (a, b) =>
        (b.friendsCount ?? 0) - (a.friendsCount ?? 0) ||
        (b.membersCount ?? 0) - (a.membersCount ?? 0),
    );

/**
 * "Your friends joined" (DEV-384): from each community's `friends_count` and
 * `friend_previews`, which the list carries for a signed-in reader. Hidden
 * when no community has enough of them.
 */
export const FriendsJoinedSection = ({ communities }: { communities: Community[] }) => {
  const picks = friendsJoined(communities);
  const { visible, isExpanded, hasMore, toggle } = useShowMore(picks, VISIBLE);

  if (picks.length === 0) return null;

  return (
    <section aria-label="Your friends joined" className="mt-8">
      <h2 className="text-[22px] font-bold tracking-[-0.3px] text-brand-ink">
        Your friends joined
      </h2>

      <div className={cn('mt-5', COMMUNITY_GRID)}>
        {visible.map((community) => (
          <CommunityCard key={community.id} community={community} showFriends />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isExpanded}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[14.5px] font-semibold text-brand hover:underline"
        >
          {isExpanded ? 'Show less' : 'Show more'}
          <IconComponent
            iconName={isExpanded ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
            size={16}
            color="currentColor"
          />
        </button>
      )}
    </section>
  );
};
