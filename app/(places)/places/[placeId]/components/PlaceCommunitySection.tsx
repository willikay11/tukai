import { SectionShell } from '@/app/shared/components/Sections';
import { NoData } from '@/components/ui/noData';

/**
 * ⚠️ NO BACKEND. Nothing links a place to a community: the place payload has no
 * community field, `/v1/places/{id}/communities/` is a 404, and `?place=` on
 * `/v1/communities/` is silently ignored (it returns the full unfiltered list,
 * 9 of 9). Heading plus empty state rather than an invented card.
 */
export const PlaceCommunitySection = () => (
  <SectionShell id="community" title="Community">
    <div className="py-10">
      <NoData message="No community is linked to this place yet" />
    </div>
  </SectionShell>
);
