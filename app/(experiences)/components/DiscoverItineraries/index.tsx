'use client';

import { useEffect, useRef, useState } from 'react';

import { ItineraryCard } from '@/app/(experiences)/components/ItineraryCard';
import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { IconComponent } from '@/app/shared/components/Icons';
import { FannedPhotos } from '@/app/shared/components/Images';
import { useRailPaging } from '@/app/shared/components/Lists';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';

import { DEFAULT_CARD_WIDTH, RAIL_LIMIT, railCardWidth, railStep } from './discover-itineraries';

const TITLE = 'Discover itineraries';
const SUBTITLE = 'Several places in one plan, organised by a community';

/** Cards in view on a laptop; their photos skip the lazy-load observer. */
const EAGER_IN_ROW = 3;

/** How far above the section "See less" brings the page back to, clear of the top bar. */
const SCROLL_BACK_OFFSET = 140;

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

/**
 * The track. The header's 16px margin and 18px of padding would leave 34px;
 * the negative margin takes it back to the design's 18. The padding itself
 * stays, so a card's hover lift has room inside the scroll box.
 */
const TRACK =
  '-mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-0.5 pb-3 pt-[18px] scrollbar-hide';

const GRID = 'mt-0.5 grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-x-4 gap-y-[26px]';

/** The 24px arrow after the title that expands the section, 44px to hit. */
const TitleArrow = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="See all itineraries"
    className={cn(
      'relative flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-surface-brand bg-surface-brand text-brand transition-colors hover:bg-surface-brand-hover active:scale-[0.96]',
      'before:absolute before:-inset-2.5 before:content-[""]',
      FOCUS_RING,
    )}
  >
    <IconComponent iconName="ArrowRight01Icon" size={14} color="currentColor" />
  </button>
);

/**
 * The rail's last tile: the covers of the three itineraries just past it,
 * fanned over "See all". It expands the section rather than navigating.
 */
const SeeAllTile = ({
  itineraries,
  width,
  onClick,
}: {
  itineraries: Experience[];
  width: number;
  onClick: () => void;
}) => {
  const [left, centre, right] = itineraries.map((itinerary) =>
    coverPhotoUrl(itinerary.photos, 'md'),
  );

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="See all itineraries"
      // The measured width, and as tall as it is wide to match the covers
      style={{ flex: `0 0 ${width}px`, height: width }}
      className={cn(
        'flex snap-start flex-col items-center justify-center gap-4 self-start rounded-xl border border-surface-muted bg-white transition-shadow hover:shadow-[0_8px_26px_rgba(1,51,52,.09)] active:scale-[0.98]',
        FOCUS_RING,
      )}
    >
      <span className="flex h-[76px] w-[124px] items-center justify-center">
        {/* FannedPhotos takes centre first */}
        <FannedPhotos photos={[centre, left, right]} size="md" />
      </span>
      <span className="text-[15px] font-bold text-brand">See all</span>
    </button>
  );
};

/**
 * The rail's card width, measured so whole cards fill it - see
 * `railCardWidth`. Remeasured whenever the rail changes size.
 */
const useCardWidth = (ref: React.RefObject<HTMLElement | null>) => {
  const [width, setWidth] = useState(DEFAULT_CARD_WIDTH);

  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;

    const measure = () => {
      const next = railCardWidth(rail.clientWidth);
      if (next !== null) setWidth(next);
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    return () => observer.disconnect();
  }, [ref]);

  return width;
};

const CollapsedRail = ({
  itineraries,
  onExpand,
}: {
  itineraries: Experience[];
  onExpand: () => void;
}) => {
  const { ref, atStart, atEnd } = useRailPaging<HTMLDivElement>();
  const cardWidth = useCardWidth(ref);

  const shown = itineraries.slice(0, RAIL_LIMIT);
  const hasMore = itineraries.length > RAIL_LIMIT;

  // Whole cards at a time, so a card is never left cut in half at the edge
  const page = (direction: 1 | -1) => {
    const rail = ref.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * railStep(rail.clientWidth, cardWidth), behavior: 'smooth' });
  };

  // Arrows that can never do anything are left out, as on every other rail
  const canScroll = !(atStart && atEnd);

  return (
    <>
      <SectionHeader
        title={TITLE}
        subtitle={SUBTITLE}
        titleAction={hasMore ? <TitleArrow onClick={onExpand} /> : undefined}
        railLabel="itineraries"
        onBack={canScroll ? () => page(-1) : undefined}
        onNext={canScroll ? () => page(1) : undefined}
        atStart={atStart}
        atEnd={atEnd}
      />

      <div ref={ref} className={TRACK}>
        {shown.map((itinerary, index) => (
          <ItineraryCard
            key={itinerary.id}
            itinerary={itinerary}
            position={index}
            priority={index < EAGER_IN_ROW}
            className="snap-start"
            style={{ flex: `0 0 ${cardWidth}px` }}
          />
        ))}

        {hasMore && (
          <SeeAllTile
            itineraries={itineraries.slice(RAIL_LIMIT, RAIL_LIMIT + 3)}
            width={cardWidth}
            onClick={onExpand}
          />
        )}
      </div>
    </>
  );
};

const ExpandedGrid = ({
  itineraries,
  onCollapse,
}: {
  itineraries: Experience[];
  onCollapse: () => void;
}) => (
  <>
    <SectionHeader
      title={TITLE}
      subtitle={SUBTITLE}
      action={
        <button
          type="button"
          onClick={onCollapse}
          className={cn(
            '-mb-2.5 -mr-1 inline-flex h-11 flex-shrink-0 items-center whitespace-nowrap px-1 text-[14.5px] font-bold text-brand hover:text-brand-deep',
            FOCUS_RING,
          )}
        >
          See less
        </button>
      }
    />

    <div className={GRID}>
      {itineraries.map((itinerary, index) => (
        <ItineraryCard
          key={itinerary.id}
          itinerary={itinerary}
          position={index}
          priority={index < EAGER_IN_ROW}
        />
      ))}
    </div>

    <div className="mt-7 flex justify-center">
      <button
        type="button"
        onClick={onCollapse}
        className={cn(
          'inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full bg-surface px-5 text-[14.5px] font-bold text-brand transition-colors hover:bg-surface-brand active:scale-[0.98]',
          FOCUS_RING,
        )}
      >
        <IconComponent iconName="ArrowUp01Icon" size={16} color="currentColor" />
        See less
      </button>
    </div>
  </>
);

/** Five grey squares under the real header, so nothing jumps on arrival. */
export const DiscoverItinerariesSkeleton = () => (
  <section aria-hidden="true">
    <SectionHeader title={TITLE} subtitle={SUBTITLE} />
    <div className={TRACK}>
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="aspect-square w-[184px] flex-shrink-0 animate-pulse rounded-xl bg-gray-200"
        />
      ))}
    </div>
  </section>
);

/**
 * "Discover itineraries": a rail of up to ten itinerary cards, closed by a See
 * all tile when there are more, which expands the section into a grid of all
 * of them in place.
 *
 * `itineraries` is the pool, already narrowed to what is upcoming and sorted
 * by date - see `useUpcomingItineraries`. Nothing shows without one.
 *
 * Give it a `key` of the city: a different city is a different pool, so the
 * section starts collapsed again.
 */
export const DiscoverItineraries = ({ itineraries }: { itineraries: Experience[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  if (itineraries.length === 0) return null;

  const collapse = () => {
    setIsExpanded(false);

    // The grid was long; if the reader scrolled past the section's top, bring
    // them back to it rather than leaving them wherever the page now ends
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top;
    if (top < 0) {
      window.scrollTo({
        top: Math.max(0, top + window.scrollY - SCROLL_BACK_OFFSET),
        behavior: 'smooth',
      });
    }
  };

  return (
    <section ref={sectionRef}>
      {isExpanded ? (
        <ExpandedGrid itineraries={itineraries} onCollapse={collapse} />
      ) : (
        <CollapsedRail itineraries={itineraries} onExpand={() => setIsExpanded(true)} />
      )}
    </section>
  );
};
