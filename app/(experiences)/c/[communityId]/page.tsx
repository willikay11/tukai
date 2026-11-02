import { Suspense } from 'react';

import { DiscoverPageContent, SharedLinkLanding } from '@/app/(experiences)/components';

// The same preview the full community page gives, so a shared link unfurls with
// the community's own title, description and card
export { generateMetadata } from '@/app/(communities)/communities/[communityId]/page';

/**
 * A shared community link, `tukai.co/c/{id}`: Discover, with the community open
 * in its drawer. The full page stays at its own route for anyone who goes there.
 */
export default function SharedCommunityPage({ params }: { params: { communityId: string } }) {
  return (
    <>
      {/* Discover reads its filters from the URL; see app/(experiences)/page.tsx */}
      <Suspense fallback={null}>
        <DiscoverPageContent />
      </Suspense>
      <SharedLinkLanding kind="community" id={params.communityId} />
    </>
  );
}
