import { Suspense } from 'react';

import type { Metadata } from 'next';

import { BucketListsPageContent } from './BucketListsPageContent';

export const metadata: Metadata = { title: 'Tukai - Bucket Lists' };

export default function BucketListsPage() {
  // The tab and an invite ride in the query string, which needs a boundary
  return (
    <Suspense fallback={null}>
      <BucketListsPageContent />
    </Suspense>
  );
}
