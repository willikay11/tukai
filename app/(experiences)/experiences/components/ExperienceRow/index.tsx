import Link from 'next/link';

import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { shouldShowSeeAll } from '@/app/(experiences)/experiences/see-all/config';
import { SingleExperience } from '@/app/shared/components/Experiences/Single';
import { ScrollRow } from '@/app/shared/components/Lists';
import { Experience } from '@/types/experience';

import { RowSkeleton } from './RowSkeleton';

interface ExperienceRowProps {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  // API total for the section, which is larger than the page the row renders
  total?: number;
  experiences: Experience[];
  isLoading: boolean;
  icon?: string;
}

export const ExperienceRow = ({
  title,
  subtitle,
  seeAllHref,
  total,
  experiences,
  isLoading,
  icon,
}: ExperienceRowProps) => {
  // Hide the whole section when it loaded empty
  if (!isLoading && experiences.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader
        icon={icon}
        title={title}
        subtitle={subtitle}
        seeAllHref={shouldShowSeeAll(total) ? seeAllHref : undefined}
      />
      {isLoading ? (
        <RowSkeleton />
      ) : (
        <ScrollRow>
          {experiences.map((experience) => (
            <div key={experience.id} className="w-[280px] flex-shrink-0 snap-start">
              <Link target="_blank" href={`/experiences/${experience.id}`}>
                <SingleExperience type="discover" variant="row" experience={experience} />
              </Link>
            </div>
          ))}
        </ScrollRow>
      )}
    </section>
  );
};

export { RowSkeleton };
