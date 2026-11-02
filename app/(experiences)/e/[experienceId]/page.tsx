import { Suspense } from 'react';

import { DiscoverPageContent, SharedLinkLanding } from '@/app/(experiences)/components';

// The same preview the full experience page gives, so a shared link unfurls with
// the experience's own title, description and card
export { generateMetadata } from '@/app/(experiences)/experiences/[experienceId]/page';

/**
 * A shared experience link, `tukai.co/e/{id}`: Discover, with the experience open
 * in its drawer. The full page stays at its own route for anyone who goes there.
 */
export default function SharedExperiencePage({ params }: { params: { experienceId: string } }) {
  return (
    <>
      {/* Discover reads its filters from the URL; see app/(experiences)/page.tsx */}
      <Suspense fallback={null}>
        <DiscoverPageContent />
      </Suspense>
      <SharedLinkLanding kind="experience" id={params.experienceId} />
    </>
  );
}
