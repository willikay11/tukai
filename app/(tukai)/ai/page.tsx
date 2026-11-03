import { Metadata } from 'next';

import { TukaiPageContent } from './components/TukaiPageContent';

export const metadata: Metadata = {
  title: 'TukAI · Tukai',
  description: 'Ask TukAI for places, plans and experiences on Tukai.',
};

export default function TukaiPage() {
  return <TukaiPageContent />;
}
