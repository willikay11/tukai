import { Suspense } from 'react';

import { DiscoverPageContent, SharedLinkLanding } from '@/app/(experiences)/components';
import { fetchCommunity } from '@/services/community';

// The same preview the full community page gives, so a shared link unfurls with
// the community's own title, description and card
export { generateMetadata } from '@/app/(communities)/communities/[communityId]/page';

/**
 * A shared community link, `tukai.co/c/{slug}`: Discover, with the community open
 * in its drawer. The full page stays at its own route for anyone who goes there.
 */
export default async function SharedCommunityPage({ params }: { params: { communityId: string } }) {
  // The link carries the slug, but the drawer's other queries - reviews,
  // members, upcoming events - go by id, so resolve it here. An id link, or a
  // lookup that fails, opens with what the link carries
  const id = await fetchCommunity(params.communityId)
    .then((response) => response.data?.id ?? params.communityId)
    .catch(() => params.communityId);

  return (
    <>
      {/* Discover reads its filters from the URL; see app/(experiences)/page.tsx */}
      <Suspense fallback={null}>
        <DiscoverPageContent />
      </Suspense>
      <SharedLinkLanding kind="community" id={id} />
    </>
  );
}
