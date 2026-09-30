import { Metadata } from 'next';

import { PlansPageContent } from './PlansPageContent';

export const metadata: Metadata = {
  title: 'My plans · Tukai',
  description: 'Days out you have planned, and the stops on them.',
};

export default function PlansPage() {
  return <PlansPageContent />;
}
