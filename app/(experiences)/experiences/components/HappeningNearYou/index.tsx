import Link from 'next/link';

import { RowSkeleton } from '@/app/(experiences)/experiences/components/ExperienceRow';
import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { NEAR_ME_RADIUS_KM } from '@/app/(experiences)/experiences/see-all/config';
import { SingleExperience } from '@/app/shared/components/Experiences/Single';
import { IconComponent } from '@/app/shared/components/Icons';
import { ScrollRow } from '@/app/shared/components/Lists';
import { CARD_LIFT } from '@/app/shared/components/Motion';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { experiencePath } from '@/utils/detail-paths';

interface HappeningNearYouProps {
  /** What the row shows: the first page, or every match once expanded. */
  experiences: Experience[];
  /** The API total, which is what the toggle names. */
  total: number;
  /** True while the API holds more than the first page. */
  hasMore: boolean;
  isLoading: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

const NearCard = ({ experience }: { experience: Experience }) => (
  <Link target="_blank" href={experiencePath(experience)} className={cn('group block', CARD_LIFT)}>
    <SingleExperience type="discover" variant="row" experience={experience} />
  </Link>
);

/**
 * The near-me row. Collapsed, it is a rail of the first page. The "All N"
 * toggle expands it in place to a grid of every match, and "See less" folds it
 * back. The city is left out of the subtitle until EL-00 is revisited.
 */
export const HappeningNearYou = ({
  experiences,
  total,
  hasMore,
  isLoading,
  isExpanded,
  onToggle,
}: HappeningNearYouProps) => {
  // Hide the whole section when it loaded empty
  if (!isLoading && experiences.length === 0) {
    return null;
  }

  const showToggle = hasMore || isExpanded;

  return (
    <section>
      <SectionHeader
        title="Happening near you"
        subtitle={`Within ${NEAR_ME_RADIUS_KM} km`}
        action={
          showToggle ? (
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isExpanded}
              className="-my-2 -mr-1 inline-flex h-11 flex-shrink-0 items-center gap-1.5 whitespace-nowrap px-1 text-[15px] font-bold text-brand hover:text-brand-deep"
            >
              {isExpanded ? 'See less' : `All ${total}`}
              <IconComponent
                iconName={isExpanded ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
                size={18}
                color="currentColor"
                className="flex-shrink-0"
              />
            </button>
          ) : undefined
        }
      />

      {isLoading ? (
        <RowSkeleton />
      ) : isExpanded ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-4">
          {experiences.map((experience) => (
            <div key={experience.id}>
              <NearCard experience={experience} />
            </div>
          ))}
        </div>
      ) : (
        <ScrollRow>
          {experiences.map((experience) => (
            <div key={experience.id} className="w-[280px] flex-shrink-0 snap-start">
              <NearCard experience={experience} />
            </div>
          ))}
        </ScrollRow>
      )}
    </section>
  );
};
