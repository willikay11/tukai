import type { Metadata } from 'next';

import { BucketListPageContent } from './BucketListPageContent';

export const metadata: Metadata = { title: 'Tukai - Bucket List' };

export default function BucketListPage({ params }: { params: { bucketListId: string } }) {
  // Bucket lists are the reader's own and need their token, so the fetch
  // happens client-side rather than on the server as public pages do
  return <BucketListPageContent bucketListId={params.bucketListId} />;
}
