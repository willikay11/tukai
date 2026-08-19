import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface CityCardProps {
  city: string;
  experienceCount: number;
  imageUrl: string;
  href: string;
  // Overrides the fixed row sizing — the cities grid wants full-width cards
  className?: string;
}

export const CityCard = ({
  city,
  experienceCount,
  imageUrl,
  href,
  className,
}: CityCardProps) => (
  <Link
    href={href}
    className={cn(
      'relative block h-[130px] w-[240px] flex-shrink-0 overflow-hidden rounded-xl',
      className,
    )}
  >
    {imageUrl ? (
      <Image
        src={imageUrl}
        alt={city}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 300px"
        className="object-cover"
      />
    ) : (
      <div className="h-full w-full bg-gray-200" />
    )}

    {/* Dark overlay for text legibility */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />

    <div className="absolute bottom-3 left-4">
      <p className="text-base font-bold text-white">{city}</p>
      <p className="text-xs text-white/70">
        {experienceCount >= 100 ? '100+ experiences' : `${experienceCount} experiences`}
      </p>
    </div>
  </Link>
);
