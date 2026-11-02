import { Suspense } from 'react';

import { DiscoverPageContent, SharedLinkLanding } from '@/app/(experiences)/components';
import { fetchExperience } from '@/services/experience';

// The same preview the full experience page gives, so a shared link unfurls with
// the experience's own title, description and card
export { generateMetadata } from '@/app/(experiences)/experiences/[experienceId]/page';

/**
 * A shared experience link, `tukai.co/e/{slug}`: Discover, with the experience open
 * in its drawer. The full page stays at its own route for anyone who goes there.
 */
export default async function SharedExperiencePage({
  params,
}: {
  params: { experienceId: string };
}) {
  // The link carries the slug, but the drawer's other queries - reviews,
  // members, upcoming events - go by id, so resolve it here. An id link, or a
  // lookup that fails, opens with what the link carries
  const id = await fetchExperience(params.experienceId)
    .then((response) => response.data?.id ?? params.experienceId)
    .catch(() => params.experienceId);

  return (
    <>
      {/* Discover reads its filters from the URL; see app/(experiences)/page.tsx */}
      <Suspense fallback={null}>
        <DiscoverPageContent />
      </Suspense>
      <SharedLinkLanding kind="experience" id={id} />
    </>
  );
}
