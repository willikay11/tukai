'use client';

import { useRef, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { Experience } from '@/types/experience';

import { HappeningNowCard } from './HappeningNowCard';
import { ongoingExperiences } from './happening-now';

/**
 * What is on at a place right now, as a swipeable row with a dot per card.
 *
 * Reads the experiences the drawer already loaded for Upcoming, so it makes no
 * request of its own. Renders nothing when nothing is on.
 */
export const HappeningNow = ({
  experiences,
  placeTitle,
}: {
  experiences: Experience[];
  placeTitle: string;
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onNow = ongoingExperiences(experiences);
  if (onNow.length === 0) return null;

  // Distance from one card to the next, gap included. Read off the DOM because
  // the card width is a percentage of the row
  const stepWidth = (): number => {
    const [first, second] = Array.from(rowRef.current?.children ?? []);
    if (!(first instanceof HTMLElement) || !(second instanceof HTMLElement)) return 0;
    return second.offsetLeft - first.offsetLeft;
  };

  const handleScroll = () => {
    const step = stepWidth();
    if (!rowRef.current || step === 0) return;
    setActiveIndex(Math.round(rowRef.current.scrollLeft / step));
  };

  const goTo = (index: number) => {
    if (rowRef.current) rowRef.current.scrollLeft = index * stepWidth();
    setActiveIndex(index);
  };

  return (
    <div className="mb-6 space-y-4 border-b border-line pb-6">
      <div>
        {/* The design makes this a button, but the excerpt does not say where it
            leads yet, so it is a heading until a destination is decided */}
        <h3 className="flex items-center gap-1.5 text-[19px] font-bold tracking-[-0.2px] text-brand-ink">
          Happening now
          <span aria-hidden className="flex">
            <IconComponent iconName="ArrowRight01Icon" size={20} color="currentColor" />
          </span>
        </h3>
        <p className="mt-1.5 text-[14px] leading-snug text-ink-muted">
          Ongoing experiences at {placeTitle}
        </p>
      </div>

      <div
        ref={rowRef}
        onScroll={handleScroll}
        className="-mx-6 flex snap-x snap-mandatory scroll-px-6 gap-3 overflow-x-auto scroll-smooth px-6 scrollbar-hide"
      >
        {onNow.map((experience) => (
          <HappeningNowCard key={experience.id} experience={experience} />
        ))}
      </div>

      {onNow.length > 1 && (
        <div className="-my-3 -ml-2 flex items-center">
          {onNow.map((experience, index) => (
            <button
              key={experience.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Show experience ${index + 1} of ${onNow.length}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              className="flex h-11 w-[26px] items-center justify-center"
            >
              <span
                className={
                  index === activeIndex
                    ? 'block h-1.5 w-[18px] rounded-full bg-brand transition-all'
                    : 'block h-1.5 w-1.5 rounded-full bg-line transition-all'
                }
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
