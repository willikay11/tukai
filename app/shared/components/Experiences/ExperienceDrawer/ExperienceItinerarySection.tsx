import { ItineraryDayByDay } from '@/app/(experiences)/experiences/components/ItineraryDayByDay';
import { Experience } from '@/types/experience';

import { EXPERIENCE_SECTIONS } from './tabs';

/**
 * Day by day (ED mirror of the experience page's own section) - only an
 * itinerary ever has days, so this skips the fetch entirely for a standard
 * experience rather than asking `ItineraryDayByDay` to come back empty.
 */
export const ExperienceItinerarySection = ({ experience }: { experience: Experience }) => {
  if (experience.experienceType !== 'itinerary') return null;

  return (
    <div
      id={EXPERIENCE_SECTIONS.dayByDay}
      className="scroll-mt-[156px] space-y-4 border-t border-line pt-6"
    >
      <ItineraryDayByDay experienceId={experience.id} startDate={experience.startDate} />
    </div>
  );
};
