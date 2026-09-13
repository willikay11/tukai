import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

export const AskTukaiButton = ({
  className,
  iconSize = 18,
}: {
  // The header sizes it to the 40px nav row; the mobile bar floats it larger
  className?: string;
  iconSize?: number;
}) => {
  return (
    <button
      type="button"
      className={cn(
        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary transition-colors hover:bg-primary/90',
        className,
      )}
      aria-label="Ask TukAI"
    >
      <IconComponent iconName="SparklesIcon" size={iconSize} className="text-lime" />
    </button>
  );
};
