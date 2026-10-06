import Link from 'next/link';

import {
  experiencePriceLine,
  experienceRunBy,
} from '@/app/(experiences)/components/ExperienceCard/experience-flag';
import { PhotoImage } from '@/app/shared/components/Images';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { experiencePath } from '@/utils/detail-paths';

/**
 * One experience on now, in the place drawer's Happening now row: a 56px photo,
 * then the title, then the price and who is running it.
 *
 * A link rather than a drawer opening, for the same reason as the Upcoming
 * cards - a drawer cannot yet open from inside the place drawer.
 */
export const HappeningNowCard = ({ experience }: { experience: Experience }) => {
  const priceLine = experiencePriceLine(experience);
  const runBy = experienceRunBy(experience);

  return (
    <Link
      href={experiencePath(experience)}
      className="flex w-[min(340px,80%)] flex-shrink-0 snap-start items-center gap-3 rounded-2xl border border-line-soft bg-surface py-2.5 pl-2.5 pr-3.5 transition-colors hover:border-line-brand"
    >
      <PhotoImage
        src={coverPhotoUrl(experience.photos, 'md')}
        alt=""
        width={56}
        height={56}
        sizes="56px"
        className="h-14 w-14 flex-shrink-0 rounded-[10px] bg-surface-brand object-cover"
      />

      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="truncate text-[15.5px] font-semibold text-brand-ink">
          {experience.title}
        </span>

        <span className="flex min-w-0 items-center gap-2 text-[13.5px] text-ink-muted">
          {priceLine && (
            <span className="flex-shrink-0 font-semibold text-brand-ink">{priceLine}</span>
          )}
          {priceLine && runBy && (
            <span aria-hidden className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-distance" />
          )}
          {runBy && <span className="min-w-0 truncate">By {runBy}</span>}
        </span>
      </span>
    </Link>
  );
};
