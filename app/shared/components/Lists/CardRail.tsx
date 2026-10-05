'use client';

import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';

import { ScrollRow } from './ScrollRow';
import { useRailPaging } from './useRailPaging';

/**
 * A section heading over a rail the heading's arrows page.
 *
 * The two belong together — the arrows need the rail's scroll position to know
 * when to grey out — so this owns both rather than asking every section to
 * thread a ref from one to the other.
 */
export const CardRail = ({
  title,
  subtitle,
  seeAllHref,
  showArrows = true,
  children,
}: {
  title: string;
  subtitle?: string;
  /** Only used where the rail has no see-all card of its own. */
  seeAllHref?: string;
  /**
   * False where the section would rather send the reader on than page in
   * place. The rail still scrolls; it just has no arrows over it.
   */
  showArrows?: boolean;
  children: React.ReactNode;
}) => {
  const { ref, atStart, atEnd, onBack, onNext } = useRailPaging<HTMLDivElement>();

  // A rail whose cards all fit reports both ends at once. Arrows that can
  // never do anything are noise, so they are left out rather than drawn and
  // greyed — and a See all link, where the section has one, takes the space
  // back.
  const canScroll = showArrows && !(atStart && atEnd);

  return (
    <section>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        seeAllHref={seeAllHref}
        railLabel={title.toLowerCase()}
        onBack={canScroll ? onBack : undefined}
        onNext={canScroll ? onNext : undefined}
        atStart={atStart}
        atEnd={atEnd}
      />
      <ScrollRow ref={ref}>{children}</ScrollRow>
    </section>
  );
};
