import Link from 'next/link';

import { FannedPhotos } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';

interface SeeAllCardProps {
  href: string;
  // Up to three photos from the row it closes, fanned as a preview of what
  // sits behind the link.
  previewPhotos?: (string | null | undefined)[];
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
export const SeeAllCard = ({ href, previewPhotos = [], className }: SeeAllCardProps) => (
  <Link
    href={href}
    className={cn(
      'flex aspect-[4/3] w-[280px] flex-shrink-0 snap-start flex-col items-center justify-center gap-3 self-start rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.10)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.14)]',
      className,
    )}
  >
    {/* Fixed height so the label sits at the same place whether or not the row
        handed over any photos */}
    <div className="flex h-20 items-center justify-center">
      <FannedPhotos photos={previewPhotos} size="md" />
    </div>

    <span className="text-base font-semibold text-primary">See All</span>
  </Link>
);
