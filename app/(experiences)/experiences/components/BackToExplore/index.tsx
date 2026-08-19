'use client';

import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

interface BackToExploreProps {
  label?: string;
  // 'pill' is the outlined button used in page headers; 'link' is the bare
  // inline treatment used on the experience detail page
  variant?: 'link' | 'pill';
}

export const BackToExplore = ({
  label = 'Back to Explore',
  variant = 'link',
}: BackToExploreProps) => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        'flex items-center gap-2 text-sm transition-colors',
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
