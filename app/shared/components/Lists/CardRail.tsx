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
  children,
}: {
  title: string;
  subtitle?: string;
  /** Only used where the rail has no see-all card of its own. */
  seeAllHref?: string;
  children: React.ReactNode;
}) => {
  const { ref, atStart, atEnd, onBack, onNext } = useRailPaging<HTMLDivElement>();

  return (
    <section>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        seeAllHref={seeAllHref}
        railLabel={title.toLowerCase()}
        onBack={onBack}
        onNext={onNext}
        atStart={atStart}
        atEnd={atEnd}
      />
      <ScrollRow ref={ref}>{children}</ScrollRow>
    </section>
  );
};
