import { Suspense } from 'react';

import { DiscoverPageContent, SharedLinkLanding } from '@/app/(experiences)/components';
import { fetchPlace } from '@/services/place';

// The same preview the full place page gives, so a shared link unfurls with
// the place's own title, description and card
export { generateMetadata } from '@/app/(places)/places/[placeId]/page';

/**
 * A shared place link, `tukai.co/p/{slug}`: Discover, with the place open
 * in its drawer. The full page stays at its own route for anyone who goes there.
 */
export default async function SharedPlacePage({ params }: { params: { placeId: string } }) {
  // The link carries the slug, but the drawer's other queries - reviews,
  // members, upcoming events - go by id, so resolve it here. An id link, or a
  // lookup that fails, opens with what the link carries
  const id = await fetchPlace(params.placeId)
    .then((response) => response.data?.id ?? params.placeId)
    .catch(() => params.placeId);

  return (
    <>
      {/* Discover reads its filters from the URL; see app/(experiences)/page.tsx */}
      <Suspense fallback={null}>
        <DiscoverPageContent />
      </Suspense>
      <SharedLinkLanding kind="place" id={id} />
    </>
  );
}
