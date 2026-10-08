'use client';

import Link from 'next/link';

import { SectionHeader } from '@/app/(experiences)/experiences/components/SectionHeader';
import { shouldShowSeeAll } from '@/app/(experiences)/experiences/see-all/config';
import { SingleExperience } from '@/app/shared/components/Experiences/Single';
import { ScrollRow, SeeAllCard } from '@/app/shared/components/Lists';
import { CARD_LIFT } from '@/app/shared/components/Motion';
import { useExperienceDrawer } from '@/context/ExperienceDrawerContext';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { experiencePath } from '@/utils/detail-paths';

import { RowSkeleton } from './RowSkeleton';

const coverOf = (experience: Experience | undefined): string | null =>
  coverPhotoUrl(experience?.photos, 'md') ?? null;

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
  const drawer = useExperienceDrawer();

  // Hide the whole section when it loaded empty
  if (!isLoading && experiences.length === 0) {
    return null;
  }

  return (
    <section>
      <SectionHeader icon={icon} title={title} subtitle={subtitle} />
      {isLoading ? (
        <RowSkeleton />
      ) : (
        <ScrollRow>
          {experiences.map((experience) => (
            <div key={experience.id} className="w-[280px] flex-shrink-0 snap-start">
              <Link
                href={experiencePath(experience)}
                onClick={(event) => {
                  // A modifier asks the browser for something else - a new
                  // tab, a new window - and the link should do that rather
                  // than the drawer
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  if (!drawer) return;

                  event.preventDefault();
                  drawer.openExperience(experience.id);
                }}
                className={cn('group block', CARD_LIFT)}
              >
                <SingleExperience type="discover" variant="row" experience={experience} />
              </Link>
            </div>
          ))}

          {seeAllHref && shouldShowSeeAll(total) && (
            <SeeAllCard href={seeAllHref} previewPhotos={experiences.slice(0, 3).map(coverOf)} />
          )}
        </ScrollRow>
      )}
    </section>
  );
};

export { RowSkeleton };
