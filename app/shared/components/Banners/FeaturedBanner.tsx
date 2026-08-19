'use client';

import Image from 'next/image';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';

interface FeaturedBannerProps {
  badgeLabel: string; // "Featured Experience" | "Featured This Week"
  badgeIcon?: string; // optional hugeicons name shown inside the badge
  coverPhoto: string | null;
  title: string;
  metaItems: string[]; // ["Beach Club", "Diani", "Ksh. 3,500 avg"]
  rating?: number | null;
  ctaLabel: string; // "Reserve a spot — Ksh. X" | "Reserve a table"
  onCtaClick: () => void;
  // Optional outlined companion action, e.g. "View details" beside "Reserve"
  secondaryCtaLabel?: string;
  onSecondaryCtaClick?: () => void;
}

export const FeaturedBanner = ({
  badgeLabel,
  badgeIcon,
  coverPhoto,
  title,
  metaItems,
  rating = null,
  ctaLabel,
  onCtaClick,
  secondaryCtaLabel,
  onSecondaryCtaClick,
}: FeaturedBannerProps) => (
  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl md:aspect-[3/1]">
    {coverPhoto ? (
      <Image
        src={coverPhoto}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 1280px"
        className="object-cover"
        priority
      />
    ) : (
      <div className="h-full w-full bg-gray-200" />
    )}

    {/* Dark gradient so the text stays readable */}
    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

    <div className="absolute bottom-0 left-0 max-w-xl p-6 md:p-10">
      {/* Lime badge */}
      <div className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-900">
        {badgeIcon && <IconComponent iconName={badgeIcon} size={14} className="text-gray-900" />}
        {badgeLabel}
      </div>

      {/* Title */}
      <h2 className="mt-4 text-2xl font-bold text-white md:text-4xl">{title}</h2>

      {/* Meta line */}
      {(metaItems.length > 0 || rating != null) && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-white/80">
          {metaItems.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span className="inline-block h-1 w-1 rounded-full bg-white/60" />}
              {item}
            </span>
          ))}
          {rating != null && (
            <span className="flex items-center gap-1.5">
              {metaItems.length > 0 && (
                <span className="inline-block h-1 w-1 rounded-full bg-white/60" />
              )}
              <IconComponent iconName="StarIcon" size={14} className="text-yellow-400" />
              {rating}
            </span>
          )}
        </p>
      )}

      {/* Lime CTA, plus an optional outlined companion */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          variant="lime"
          onClick={onCtaClick}
          className="rounded-full px-6 font-semibold text-gray-900"
        >
          {ctaLabel}
        </Button>

        {secondaryCtaLabel && (
          <Button
            variant="outline"
            onClick={onSecondaryCtaClick}
            className="rounded-full border-white/40 bg-transparent px-6 font-medium text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
          >
            {secondaryCtaLabel}
          </Button>
        )}
      </div>
    </div>
  </div>
);
