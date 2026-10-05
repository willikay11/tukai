'use client';

import { useSession } from 'next-auth/react';

import { Bookmark } from '@/app/shared/components/Bookmark';
import { CardShell } from '@/app/shared/components/Cards/CardShell';
import { IconComponent } from '@/app/shared/components/Icons';
import { TITLE_TINT } from '@/app/shared/components/Motion';
import { useExperienceDrawer } from '@/context/ExperienceDrawerContext';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { formatCardDateTime } from '@/utils/date-utils';
import { experiencePath } from '@/utils/detail-paths';

import { experienceFlag, experiencePriceLine, experienceRunBy } from './experience-flag';

/**
 * An experience, as the canvas draws it in a rail: a square photo at 184px,
 * the save control over one corner and a flag over the other, then who is
 * running it, what it is, when, and what it costs.
 *
 * A plain click opens the experience in the drawer. The card stays a link to
 * the experience page, so a new tab, or a copied address, still gets there.
 *
 * This is deliberately not `SingleExperience`'s `row` variant. That card is
 * 4:3 at 280px and leads on distance, and five other screens render it - the
 * canvas reshaped the rail card alone, so the rail card alone is rebuilt.
 */
export const ExperienceCard = ({
  experience,
  priority = false,
  opensDrawer = true,
}: {
  experience: Experience;
  priority?: boolean;
  /**
   * Off where a drawer would stack on top of another - a card inside the place
   * drawer keeps its link until drawers can open from inside drawers.
   */
  opensDrawer?: boolean;
}) => {
  const { data: session } = useSession();
  const drawer = useExperienceDrawer();

  const flag = experienceFlag(experience);
  const runBy = experienceRunBy(experience);
  const when = formatCardDateTime(experience.startDate, experience.endDate);
  const priceLine = experiencePriceLine(experience);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    // A modifier asks the browser for something else - a new tab, a new window -
    // and the link should do that rather than the drawer
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    drawer?.openExperience(experience.id);
  };

  return (
    <CardShell
      href={experiencePath(experience)}
      onClick={drawer && opensDrawer ? handleOpen : undefined}
      src={coverPhotoUrl(experience.photos, 'md')}
      alt={experience.title}
      sizes="184px"
      // Above the fold: fetched straight away instead of waiting for the
      // lazy-load observer, which cannot fire until React has painted
      priority={priority}
      ratio="square"
      radius="rounded-xl"
      className="w-[184px] flex-shrink-0 snap-start"
      overlay={
        <>
          {/* Top-right, over the photo */}
          <div className="absolute right-0 top-0">
            <Bookmark
              bookmarked={experience.isBookmarked}
              userId={session?.user?.id}
              experienceId={experience.id}
              itemName={experience.title}
              className="text-white"
            />
          </div>

          {flag && (
            <span className="absolute left-2.5 top-2.5 inline-flex h-[26px] items-center gap-1.5 rounded-full bg-black/55 px-2.5 text-[11.5px] font-bold text-white backdrop-blur-md">
              <IconComponent iconName={flag.icon} size={14} color="currentColor" />
              {flag.text}
            </span>
          )}
        </>
      }
    >
      <div className="mt-[9px] flex flex-col gap-0.5">
        {/* Who is running it leads, set smaller than everything below it: a
            community for most experiences, a named guide for a tour */}
        {runBy && <span className="truncate text-[10px] font-semibold text-brand">{runBy}</span>}

        <p className={cn('text-sm font-semibold leading-snug text-brand-ink', TITLE_TINT)}>
          {experience.title}
        </p>

        {when && <p className="text-[12.5px] text-ink-muted">{when}</p>}

        {priceLine && <p className="mt-0.5 text-[13px] font-semibold text-gray-800">{priceLine}</p>}
      </div>
    </CardShell>
  );
};
