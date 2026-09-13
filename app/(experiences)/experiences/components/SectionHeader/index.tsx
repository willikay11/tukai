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
  // 'inline' sets the subtitle beside the title, as the row sections do.
  // 'stacked' puts it underneath on its own line and enlarges the icon tile —
  // the treatment the communities category groups use.
  layout?: 'inline' | 'stacked';
}

export const SectionHeader = ({
  title,
  subtitle,
  seeAllHref,
  icon,
  iconBgClass = 'bg-primary/10',
  iconColorClass = 'text-primary',
  layout = 'inline',
}: SectionHeaderProps) => {
  const isStacked = layout === 'stacked';

  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <div
            className={cn(
              'flex flex-shrink-0 items-center justify-center',
              isStacked ? 'h-11 w-11 rounded-xl' : 'h-9 w-9 rounded-full',
              iconBgClass,
            )}
          >
            <IconComponent
              iconName={icon}
              size={isStacked ? 20 : 18}
              color="currentColor"
              className={iconColorClass}
            />
          </div>
        )}

        {/* Inline puts the subtitle beside the title on a wide screen, but a
            long pair overflows a phone — so below sm it stacks either way */}
        <div
          className={cn(
            'flex min-w-0 flex-col',
            !isStacked && 'sm:flex-row sm:items-baseline sm:gap-2',
          )}
        >
          <h2
            className={cn('font-bold text-gray-900', isStacked ? 'text-xl' : 'text-xl sm:text-2xl')}
          >
            {title}
          </h2>
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
};
