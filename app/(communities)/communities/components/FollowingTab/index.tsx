'use client';

import { CommunityFeedTab } from '../CommunityFeedTab';

/**
 * The communities a reader follows, what those communities have coming up, and
 * the moments posted in them.
 */
export const FollowingTab = ({
  isSignedIn,
  onDiscover,
}: {
  isSignedIn: boolean;
  /** "Discover communities" on the empty state switches the page to Discover. */
  onDiscover: () => void;
}) => (
  <CommunityFeedTab
    isSignedIn={isSignedIn}
    query={{ following: true }}
    listHeading="Following"
    signedOutMessage="Sign in to see the communities you follow"
    signedOutBlurb="What they have coming up, and the moments they post, all in one place."
    emptyTitle="You are not following any communities yet"
    emptyMessage="Join one and its experiences and moments show up here. Joining never books or pays for anything."
    emptyAction={{ label: 'Discover communities', onClick: onDiscover }}
    failureMessage="Your communities could not load"
    showMoreCount={8}
  />
);
