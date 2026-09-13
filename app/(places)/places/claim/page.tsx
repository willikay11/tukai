import { Suspense } from 'react';

import type { Metadata } from 'next';

import { PageContainer } from '@/app/shared/components/Layout';

import { ClaimPlaceContent } from './ClaimPlaceContent';

export const metadata: Metadata = {
  title: 'Tukai - Connect a business/place',
};

export default function ClaimPlacePage() {
  return (
    // The form reads ?placeId / ?communityId, so it needs a boundary to
    // prerender behind
    <Suspense
      fallback={
        <PageContainer variant="detail" className="py-6 md:max-w-3xl">
          <div className="h-96 animate-pulse rounded-3xl bg-gray-100" />
        </PageContainer>
      }
    >
      <ClaimPlaceContent />
    </Suspense>
  );
}
