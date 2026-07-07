'use client';

import { useRouter } from 'next/navigation';

import { IconComponent } from '@/app/shared/components/Icons';

export const BackToExplore = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
    >
      <IconComponent iconName="ArrowLeft01Icon" size={16} />
      Back to Explore
    </button>
  );
};
