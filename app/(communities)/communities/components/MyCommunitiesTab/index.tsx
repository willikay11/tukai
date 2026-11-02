'use client';

import { useSession } from 'next-auth/react';

import { CommunityFeedTab } from '../CommunityFeedTab';
import { CreateCommunityCta } from '../CreateCommunityCta';
import { EmptyMyCommunities } from './EmptyMyCommunities';

/**
 * The communities a reader runs.
 *
 * `created_by` is the only filter the list endpoint offers for this - `role`
 * exists too but needs a member id alongside it, and the owner is the creator
 * on every community the app makes.
 */
export const MyCommunitiesTab = ({ isSignedIn }: { isSignedIn: boolean }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? undefined;

  return (
    <>
      <CommunityFeedTab
        isSignedIn={isSignedIn && Boolean(userId)}
        query={{ createdBy: userId }}
        listHeading="Created or hosted by you"
        signedOutMessage="Sign in to see the communities you run"
        signedOutBlurb="Everything you have created or host, and what is coming up in them."
        failureMessage="Your communities could not load"
        // Every one the reader owns shows, with no Show more - different from
        // Following, per the handoff's own table
        renderEmpty={() => <EmptyMyCommunities />}
      />

      {/* Below md it floats over the foot of the page in place of the main
          navigation; from md the header carries it instead */}
      {isSignedIn && <CreateCommunityCta className="md:hidden" variant="floating" />}
    </>
  );
};
