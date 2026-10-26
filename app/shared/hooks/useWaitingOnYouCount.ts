import { useSession } from 'next-auth/react';

import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { Experience } from '@/types/experience';

/**
 * How many things are waiting on the signed-in reader, for the Experiences
 * tab's reminder dot.
 *
 * The canvas's own `pendingTasks()` counts upcoming bookings, a saved draft
 * and reviews to write as well - none of those exist anywhere in this app
 * yet. This covers only invited experiences, the one "waiting on you" concept
 * that is real today (the same count `ExperiencesPageContent`'s Reserved tab
 * already shows). Treat the dot as a partial count, not the full spec.
 */
export const useWaitingOnYouCount = (): number => {
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user?.id);

  const { data: invitedResponse } = useExperiences(
    { page: 1, page_size: 50, invited: true },
    isSignedIn,
  );

  const invites: Experience[] = invitedResponse?.data?.results ?? [];

  return isSignedIn ? invites.length : 0;
};
