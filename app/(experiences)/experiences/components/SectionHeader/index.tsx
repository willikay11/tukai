'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  /**
   * Paging for the rail beneath. Given these, the header carries the canvas's
   * two circular arrows instead of a "See all" link — the link moves to the
   * card at the end of the rail, where a reader runs out of cards.
   */
  onBack?: () => void;
  onNext?: () => void;
  atStart?: boolean;
  atEnd?: boolean;
  /** Names the arrows for a screen reader: "Previous promoted places". */
  railLabel?: string;
  // ⚠️ Retired with the canvas's header, which carries no icon. Kept only for
  // the communities category groups, which still stack an icon above a title.
  icon?: string;
  iconBgClass?: string;
  iconColorClass?: string;
  layout?: 'inline' | 'stacked';
}

const Arrow = ({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: 'back' | 'next';
  label: string;
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    // 24px to look at, 44px to hit: the canvas pads the target well past the
    // circle it draws
    className={cn(
      'relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-line bg-white transition-opacity',
      'before:absolute before:-inset-2.5 before:content-[""]',
      'hover:bg-surface active:scale-[0.96]',
      disabled ? 'cursor-default opacity-[0.35]' : 'opacity-100',
    )}
  >
    <IconComponent
      iconName={direction === 'back' ? 'ArrowLeft01Icon' : 'ArrowRight01Icon'}
      size={14}
      color="currentColor"
      className="text-brand-ink"
    />
  </button>
);

export const SectionHeader = ({
  title,
  subtitle,
  seeAllHref,
  onBack,
  onNext,
  atStart = true,
  atEnd = false,
  railLabel,
  icon,
  iconBgClass = 'bg-primary/10',
  iconColorClass = 'text-primary',
  layout = 'inline',
}: SectionHeaderProps) => {
  const isStacked = layout === 'stacked';
  const hasArrows = Boolean(onBack && onNext);

  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className={cn('flex min-w-0', isStacked ? 'items-center gap-3' : 'flex-col')}>
        {icon && isStacked && (
          <div
            className={cn(
              'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl',
              iconBgClass,
            )}
          >
            <IconComponent
              iconName={icon}
              size={20}
              color="currentColor"
              className={iconColorClass}
            />
          </div>
        )}

        <div className="flex min-w-0 flex-col">
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.3px] text-brand-ink">
            {title}
          </h2>
          {subtitle && <p className="mt-[5px] text-13 text-ink-muted">{subtitle}</p>}
        </div>
      </div>

      {hasArrows ? (
        <div className="flex flex-shrink-0 items-center gap-2">
          <Arrow
            direction="back"
            label={`Previous ${railLabel ?? title}`}
            disabled={atStart}
            onClick={onBack!}
          />
          <Arrow
            direction="next"
            label={`Next ${railLabel ?? title}`}
            disabled={atEnd}
            onClick={onNext!}
          />
        </div>
      ) : (
        seeAllHref && (
          <Link
            href={seeAllHref}
            className="flex-shrink-0 text-sm font-medium text-brand hover:underline"
          >
            See all
          </Link>
        )
      )}
    </div>
  );
};
