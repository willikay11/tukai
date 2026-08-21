import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface SeeAllCardProps {
  href: string;
  // Up to three photos from the row it closes. The first sits centred and on
  // top; the next two fan out behind it to the left and right.
  previewPhotos?: (string | null | undefined)[];
  // Match the width AND image height of the cards in this row. Rows whose
  // cards are not 4:3 pass their own height here (see the cities row).
  className?: string;
}

const FannedPhoto = ({ src, side }: { src: string; side: 'left' | 'right' }) => (
  <div
    className={cn(
      'absolute top-1/2 h-14 w-14 -translate-y-1/2 overflow-hidden rounded-xl bg-gray-100 shadow-sm ring-2 ring-white',
      side === 'left' ? '-translate-x-[46px] -rotate-12' : 'translate-x-[46px] rotate-12',
    )}
  >
    <Image src={src} alt="" fill sizes="56px" className="object-cover" />
  </div>
);

/**
 * The last tile in a horizontal row, replacing the "See all" link that used to
 * sit in the section header. Keeping the action inline means it is reachable at
 * the point the reader runs out of cards, rather than back up at the heading.
 *
 * It aligns to the top of the row and matches the height of the cards' IMAGES,
 * not the full card — otherwise it would stretch past them to cover the title
 * and price beneath.
 */
export const SeeAllCard = ({ href, previewPhotos = [], className }: SeeAllCardProps) => {
  const [centre, left, right] = previewPhotos.filter(
    (photo): photo is string => typeof photo === 'string' && photo.length > 0,
  );

  return (
    <Link
      href={href}
      className={cn(
        'flex aspect-[4/3] w-[280px] flex-shrink-0 snap-start flex-col items-center justify-center gap-3 self-start rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.14)]',
        className,
      )}
    >
      <div className="relative flex h-20 w-full items-center justify-center">
        {left && <FannedPhoto src={left} side="left" />}
        {right && <FannedPhoto src={right} side="right" />}

        {/* Centred and on top of the fan */}
        <div className="relative z-10 h-20 w-20 overflow-hidden rounded-2xl bg-gray-100 ring-2 ring-white">
          {centre && <Image src={centre} alt="" fill sizes="80px" className="object-cover" />}
        </div>
      </div>

      <span className="text-base font-semibold text-primary">See All</span>
    </Link>
  );
};
