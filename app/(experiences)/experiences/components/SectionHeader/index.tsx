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
  /**
   * Put in place of the arrows or the See all link, for a section whose
   * control is neither — the grids that grow in place take a ShowMoreButton.
   */
  action?: React.ReactNode;
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
      'relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full transition-colors',
      'before:absolute before:-inset-2.5 before:content-[""]',
      'active:scale-[0.96]',
      // Live, it is a filled green disc with no outline; spent, it empties out
      // to a white one behind a hairline at 35%, and stops taking the pointer.
      // The values are the design's own (docs/design/HANDOFF.md, "Carousel
      // arrows"), which also sets the hover.
      disabled
        ? 'pointer-events-none cursor-default border border-line bg-white opacity-35'
        : 'bg-surface-brand text-brand hover:bg-surface-brand-hover',
    )}
  >
    <IconComponent
      iconName={direction === 'back' ? 'ArrowLeft01Icon' : 'ArrowRight01Icon'}
      size={14}
      color="currentColor"
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
  action,
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

      {action ?? null}

      {!action && hasArrows ? (
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
        !action &&
        seeAllHref && (
          <Link
            href={seeAllHref}
            className="-my-2 -mr-1 inline-flex h-11 flex-shrink-0 items-center gap-1.5 whitespace-nowrap px-1 text-[15px] font-bold text-brand hover:text-brand-deep"
          >
            See all
            {/* A lighter tint of the same green: the chevron points, the word
                is what gets read */}
            <IconComponent
              iconName="ArrowRight01Icon"
              size={18}
              color="currentColor"
              className="flex-shrink-0 text-brand/50"
            />
          </Link>
        )
      )}
    </div>
  );
};
