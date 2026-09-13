'use client';

import { ContextMoments } from '@/app/shared/components/Moments';

/**
 * The booking panel's moments tab.
 *
 * Everything here is the shared {@link ContextMoments} — this only shapes an
 * experience into it, including the place and community a moment posted here
 * will also surface in.
 */
export const ExperienceMoments = ({
  experienceId,
  experienceTitle,
  place,
  community,
}: {
  experienceId: string;
  experienceTitle: string;
  place?: { id: string; title: string } | null;
  community?: { id: string; title: string } | null;
}) => (
  <ContextMoments
    contextLabel={experienceTitle}
    emptyMessage="No moments from this experience yet"
    experienceId={experienceId}
    placeId={place?.id}
    placeLabel={place?.title}
    communityId={community?.id}
    communityLabel={community?.title}
  />
);
