import type { Metadata } from 'next';

import { CreateCommunityLayout } from './components/CreateCommunityLayout';

export const metadata: Metadata = {
  title: 'Tukai - Create Community',
};

export default function CreateCommunityPage() {
  return <CreateCommunityLayout />;
}
