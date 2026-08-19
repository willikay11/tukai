import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  // Hugeicons name shown in a pale circle before the title. Its presence also
  // stacks the subtitle under the title instead of running it inline.
  icon?: string;
}

export const SectionHeader = ({ title, subtitle, seeAllHref, icon }: SectionHeaderProps) => (
  <div className="mb-4 flex items-end justify-between">
    {icon ? (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <IconComponent iconName={icon} size={18} color="currentColor" className="text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      </div>
    ) : (
      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
      </div>
    )}

    {seeAllHref && (
      <Link
        href={seeAllHref}
        className="flex-shrink-0 text-sm font-medium text-primary hover:underline"
      >
        See all
      </Link>
    )}
  </div>
);
