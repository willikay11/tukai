import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  // Hugeicons name shown in a pale circle before the title
  icon?: string;
  // Tint of that circle; defaults to the brand primary
  iconBgClass?: string;
  iconColorClass?: string;
}

export const SectionHeader = ({
  title,
  subtitle,
  seeAllHref,
  icon,
  iconBgClass = 'bg-primary/10',
  iconColorClass = 'text-primary',
}: SectionHeaderProps) => (
  <div className="mb-4 flex items-end justify-between">
    <div className="flex items-center gap-3">
      {icon && (
        <div
          className={cn(
            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full',
            iconBgClass,
          )}
        >
          <IconComponent
            iconName={icon}
            size={18}
            color="currentColor"
            className={iconColorClass}
          />
        </div>
      )}

      <div className="flex items-baseline gap-2">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
      </div>
    </div>

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
