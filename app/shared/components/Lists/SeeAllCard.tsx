import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface SeeAllCardProps {
  href: string;
  // A photo from the row it closes, so the tile previews what is behind it
  previewPhoto?: string | null;
  // Match the width of the cards in the row this sits at the end of
  className?: string;
}

/**
 * The last tile in a horizontal row, replacing the "See all" link that used to
 * sit in the section header. Keeping the action inline means it is reachable at
 * the point the reader runs out of cards, rather than back up at the heading.
 */
export const SeeAllCard = ({ href, previewPhoto, className }: SeeAllCardProps) => (
  <Link
    href={href}
    className={cn(
      'flex w-[280px] flex-shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md',
      className,
    )}
  >
    <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-gray-100">
      {previewPhoto && (
        <Image src={previewPhoto} alt="" fill sizes="96px" className="object-cover" />
      )}
    </div>

    <span className="text-base font-semibold text-primary">See All</span>
  </Link>
);
