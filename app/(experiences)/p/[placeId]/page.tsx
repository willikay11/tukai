import { Suspense } from 'react';

import { DiscoverPageContent, SharedLinkLanding } from '@/app/(experiences)/components';

// The same preview the full place page gives, so a shared link unfurls with
// the place's own title, description and card
export { generateMetadata } from '@/app/(places)/places/[placeId]/page';

/**
 * A shared place link, `tukai.co/p/{id}`: Discover, with the place open
 * in its drawer. The full page stays at its own route for anyone who goes there.
 */
export default function SharedPlacePage({ params }: { params: { placeId: string } }) {
  return (
    <>
      {/* Discover reads its filters from the URL; see app/(experiences)/page.tsx */}
      <Suspense fallback={null}>
        <DiscoverPageContent />
      </Suspense>
      <SharedLinkLanding kind="place" id={params.placeId} />
    </>
  );
}
