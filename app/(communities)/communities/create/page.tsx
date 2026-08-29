import { Suspense } from 'react';

import type { Metadata } from 'next';

import { CreateCommunityLayout } from './components/CreateCommunityLayout';

export const metadata: Metadata = {
  title: 'Tukai - Create Community',
};

export default function CreateCommunityPage() {
  // The form reads ?returnTo, so it needs a boundary to prerender behind
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-gray-100" />}>
      <CreateCommunityLayout />
    </Suspense>
  );
}
