import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tukai - Create Experience',
};

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
