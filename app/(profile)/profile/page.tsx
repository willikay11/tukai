import { Metadata } from 'next';

import { ProfilePageContent } from './ProfilePageContent';

export const metadata: Metadata = {
  title: 'My profile · Tukai',
  description: 'Your profile on Tukai.',
};

export default function ProfilePage() {
  return <ProfilePageContent />;
}
