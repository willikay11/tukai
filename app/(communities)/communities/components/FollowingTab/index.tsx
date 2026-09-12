'use client';

import { CommunityFeedTab } from '../CommunityFeedTab';

/**
 * The communities a reader follows, what those communities have coming up, and
 * the moments posted in them.
 */
export const FollowingTab = ({ isSignedIn }: { isSignedIn: boolean }) => (
  <CommunityFeedTab
    isSignedIn={isSignedIn}
    query={{ following: true }}
    listHeading="Following"
    signedOutMessage="Sign in to see the communities you follow"
    signedOutBlurb="What they have coming up, and the moments they post, all in one place."
    emptyMessage="You are not following any communities yet"
    failureMessage="Your communities could not load"
  />
);
