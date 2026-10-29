import type { Metadata } from 'next';

import { DashboardContent } from './DashboardContent';

export const metadata: Metadata = {
  title: 'Tukai - Dashboard',
  description: 'Manage your bookings, places, hosted experiences and communities',
};

export default function DashboardPage() {
  return <DashboardContent />;
}
