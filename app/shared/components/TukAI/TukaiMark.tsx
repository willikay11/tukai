import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

const SIZES = {
  // The thinking row
  sm: { box: 'h-[26px] w-[26px]', icon: 14 },
  // The writing helper button
  md: { box: 'h-[30px] w-[30px]', icon: 16 },
  // Ask TukAI, Create with TukAI
  lg: { box: 'h-10 w-10', icon: 21 },
  // The paywall
  xl: { box: 'h-[52px] w-[52px]', icon: 28 },
} as const;

/** TukAI's lime circle with the sparkles in it. */
export const TukaiMark = ({
  size = 'md',
  className,
  iconClassName,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  /** Lets Ask TukAI animate the sparkle on its own. */
  iconClassName?: string;
}) => (
  <span
    aria-hidden="true"
    className={cn(
      'flex flex-shrink-0 items-center justify-center rounded-full bg-lime text-brand-ink',
      SIZES[size].box,
      className,
    )}
  >
    <IconComponent
      iconName="SparklesIcon"
      size={SIZES[size].icon}
      color="currentColor"
      className={iconClassName}
    />
  </span>
);
