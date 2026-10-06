import Link from 'next/link';

import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';

interface CityCardProps {
  city: string;
  // Omitted where the card is just a way into the city
  experienceCount?: number;
  imageUrl: string;
  href: string;
  /**
   * `banner` is the Discover rail's shape: a wide, short tile with the name
   * centred over it and the photo left bright. `default` is the taller card
   * the experiences rail and the see-all grid use, which carries a count
   * under the name and so needs the corner to itself.
   */
  variant?: 'default' | 'banner';
  // Overrides the fixed row sizing - the cities grid wants full-width cards
  className?: string;
  /**
   * Makes the card a toggle rather than a link: the city the reader has picked
   * is pressed. Given `onSelect`, `href` is not used.
   */
  onSelect?: () => void;
  selected?: boolean;
}

export const CityCard = ({
  city,
  experienceCount,
  imageUrl,
  href,
  variant = 'default',
  className,
  onSelect,
  selected = false,
}: CityCardProps) => {
  const isBanner = variant === 'banner';

  const classes = cn(
    'relative block flex-shrink-0 overflow-hidden rounded-xl',
    isBanner ? 'aspect-[8/3] w-[184px]' : 'h-[130px] w-[240px]',
    onSelect && 'cursor-pointer p-0',
    selected && 'ring-2 ring-primary',
    className,
  );

  const content = (
    <>
      <PhotoImage
        src={imageUrl}
        alt={city}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 300px"
        className="object-cover"
      />

      {/* The banner keeps the photo bright and leans on a light scrim plus the
          label's own shadow; the taller card has two lines to carry, so it
          takes the gradient */}
      <div
        className={cn(
          'absolute inset-0',
          isBanner ? 'bg-black/20' : 'bg-gradient-to-t from-black/70 to-black/10',
        )}
      />

      {isBanner ? (
        <div className="absolute inset-0 flex items-center justify-center px-3">
          <p className="truncate text-base font-bold text-white [text-shadow:0_1px_4px_rgba(1,51,52,.55)]">
            {city}
          </p>
        </div>
      ) : (
        <div className="absolute bottom-3 left-4">
          <p className="text-base font-bold text-white">{city}</p>
          {experienceCount !== undefined && (
            <p className="text-xs text-white/70">
              {experienceCount >= 100 ? '100+ experiences' : `${experienceCount} experiences`}
            </p>
          )}
        </div>
      )}
    </>
  );

  if (onSelect) {
    return (
      <button type="button" onClick={onSelect} aria-pressed={selected} className={classes}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
};
