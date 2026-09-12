import { Suspense } from 'react';

import type { Metadata } from 'next';

import { CommunitiesPageContent } from './components/CommunitiesPageContent';

export const metadata: Metadata = {
  title: 'Tukai - Communities',
  description: 'The crews that make every adventure better',
};

// No auth gate: arriving here signed out used to open the sign-in dialog
// straight away, before the reader had seen anything. The page says who it is
// for instead — Discover is browsable by anyone, and the tabs that are the
// reader's own ask them to sign in where that buys them something.
export default function CommunitiesPage() {
  // The open tab lives in the query string, and `useSearchParams` needs a
  // boundary or the whole route bails out of static rendering
  return (
    <Suspense fallback={null}>
      <CommunitiesPageContent />
    </Suspense>
  );
}
