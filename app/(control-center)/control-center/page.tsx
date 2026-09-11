import type { Metadata } from 'next';

import { ControlCenterContent } from './ControlCenterContent';

export const metadata: Metadata = {
  title: 'Tukai - Control Center',
  description: 'See how your experiences are performing',
};

export default function ControlCenterPage() {
  return <ControlCenterContent />;
}
