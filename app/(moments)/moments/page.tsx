import { Suspense } from 'react';

import type { Metadata } from 'next';

import { MomentsView } from './MomentsView';

export const metadata: Metadata = {
  title: 'Tukai - Moments',
  description: 'Real photos and stories from the Tukai community',
};

export default function MomentsPage() {
  // useSearchParams needs a Suspense boundary to avoid opting the whole route
  // out of static rendering
  return (
    <Suspense fallback={null}>
      <MomentsView />
    </Suspense>
  );
}
