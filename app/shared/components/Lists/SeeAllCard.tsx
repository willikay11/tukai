import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface SeeAllCardProps {
  href: string;
  // A photo from the row it closes, so the tile previews what is behind it
  previewPhoto?: string | null;
  // Match the width AND image height of the cards in this row. Rows whose
  // cards are not 4:3 pass their own height here (see the cities row).
  className?: string;
}

/**
 * The last tile in a horizontal row, replacing the "See all" link that used to
 * sit in the section header. Keeping the action inline means it is reachable at
 * the point the reader runs out of cards, rather than back up at the heading.
 *
 * It aligns to the top of the row and matches the height of the cards' IMAGES,
 * not the full card — otherwise it would stretch past them to cover the title
 * and price beneath.
 */
export const SeeAllCard = ({ href, previewPhoto, className }: SeeAllCardProps) => (
  <Link
    href={href}
    className={cn(
      'flex aspect-[4/3] w-[280px] flex-shrink-0 snap-start flex-col items-center justify-center gap-3 self-start rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.14)]',
      className,
    )}
  >
    <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-gray-100">
      {previewPhoto && (
        <Image src={previewPhoto} alt="" fill sizes="80px" className="object-cover" />
      )}
    </div>

    <span className="text-base font-semibold text-primary">See All</span>
  </Link>
);
