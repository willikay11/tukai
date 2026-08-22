import { IconComponent } from '@/app/shared/components/Icons';

export const AskTukaiButton = () => {
  return (
    <button
      type="button"
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary transition-colors hover:bg-primary/90"
      aria-label="Ask TukAI"
    >
      <IconComponent iconName="SparklesIcon" size={18} className="text-lime" />
    </button>
  );
};
