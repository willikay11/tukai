import type { Metadata } from 'next';

import { CommunitiesPageContent } from './components/CommunitiesPageContent';

export const metadata: Metadata = {
  title: 'Tukai - Communities',
  description: 'The crews that make every adventure better',
};

// No auth gate: arriving here signed out used to open the sign-in dialog
// straight away, before the reader had seen anything. The page says who it is
// for instead — recommendations are browsable by anyone, and "My Communities"
// asks them to sign in where the sign-in actually buys them something.
export default function CommunitiesPage() {
  return <CommunitiesPageContent />;
}
