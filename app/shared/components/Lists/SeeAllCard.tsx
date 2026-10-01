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
 * The last tile in a horizontal row, where the reader runs out of cards. The
 * canvas has exactly this — a square, quietly bordered, with three photos of
 * what lies beyond fanned above the label.
 *
 * It aligns to the top of the row and matches the height of the cards' IMAGES,
 * not the full card — otherwise it would stretch past them to cover the title
 * and price beneath.
 *
 * ⚠️ The canvas expands the rail in place here. This navigates instead: the
 * see-all pages exist, are paginated and can be linked to, which expanding in
 * place would throw away. The card itself looks the same either way.
 */
export const SeeAllCard = ({ href, previewPhotos = [], className }: SeeAllCardProps) => (
  <Link
    href={href}
    className={cn(
      'flex aspect-square w-[184px] flex-shrink-0 snap-start flex-col items-center justify-center gap-4 self-start rounded-xl border border-surface-muted bg-white transition-shadow hover:shadow-[0_8px_26px_rgba(1,51,52,.09)] active:scale-[0.98]',
      className,
    )}
  >
    {/* Fixed height so the label sits at the same place whether or not the row
        handed over any photos */}
    <div className="flex h-[76px] items-center justify-center">
      <FannedPhotos photos={previewPhotos} size="md" />
    </div>

    <span className="text-[15px] font-bold text-brand">See all</span>
  </Link>
);
