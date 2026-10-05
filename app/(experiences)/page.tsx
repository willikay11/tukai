import { Suspense } from 'react';

import { DiscoverPageContent } from '@/app/(experiences)/components';

/**
 * The page reads its filters from the URL, and `useSearchParams` opts a route
 * out of static prerendering unless it sits behind a boundary. Without this the
 * whole page fails to prerender - which is how it failed the first time.
 */
export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverPageContent />
    </Suspense>
  );
}
