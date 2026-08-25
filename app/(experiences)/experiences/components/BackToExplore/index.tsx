'use client';

import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

interface BackToExploreProps {
  label?: string;
  // Somewhere specific to go. Without it the button steps back through
  // history, which is right for a detail page reached from anywhere.
  href?: string;
  // 'pill' is the outlined button used in page headers; 'link' is the bare
  // inline treatment used on the experience detail page
  variant?: 'link' | 'pill';
}

export const BackToExplore = ({
  label = 'Back to Explore',
  href,
  variant = 'link',
}: BackToExploreProps) => {
  const router = useRouter();

  return (
    <button
      onClick={() => (href ? router.push(href) : router.back())}
      className={cn(
        // `w-fit` because a flex item stretches to fill the cross axis by
        // default — inside a `flex-col` parent (the see-all header on mobile)
        // this spanned the full width. flex-shrink-0 does not prevent that.
        'flex w-fit items-center gap-2 text-sm transition-colors',
        variant === 'pill'
          ? 'flex-shrink-0 rounded-full border border-gray-200 px-5 py-2.5 font-medium text-gray-800 hover:border-gray-300'
          : 'text-gray-700 hover:text-gray-900',
      )}
    >
      <IconComponent iconName="ArrowLeft01Icon" size={16} />
      {label}
    </button>
  );
};
