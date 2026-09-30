import { Metadata } from 'next';

import { InboxPageContent } from './InboxPageContent';

export const metadata: Metadata = {
  title: 'Inbox · Tukai',
  description: 'Your notifications and messages.',
};

export default function InboxPage() {
  return <InboxPageContent />;
}
