import type { Metadata } from 'next';

import { BucketListsPageContent } from './BucketListsPageContent';

export const metadata: Metadata = { title: 'Tukai - Bucket Lists' };

export default function BucketListsPage() {
  return <BucketListsPageContent />;
}
