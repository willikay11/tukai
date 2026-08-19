import { ReactNode } from 'react';

import { BackToExplore } from '@/app/(experiences)/experiences/components/BackToExplore';
import { Breadcrumb } from '@/app/shared/components/Breadcrumb';

// Shared chrome for every see-all view: breadcrumb, page title, result count
// and the Back pill. The body is whatever grid the section renders.
export const SeeAllLayout = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => (
  <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">
    <Breadcrumb
      variant="accent"
      items={[{ label: 'Discover', href: '/experiences' }, { label: title }]}
    />

    <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-gray-400">{subtitle}</p>}
      </div>
      <BackToExplore label="Back" variant="pill" />
    </div>

    {children}
  </main>
);
