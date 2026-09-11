import type { Metadata } from 'next';

import { CreatorStudioContent } from './CreatorStudioContent';

export const metadata: Metadata = {
  title: 'Tukai - Creator Studio',
  description: 'See how your experiences are performing',
};

export default function CreatorStudioPage() {
  return <CreatorStudioContent />;
}
