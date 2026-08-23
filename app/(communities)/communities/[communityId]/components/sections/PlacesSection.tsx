import { NoData } from '@/components/ui/noData';

import { SectionShell } from './SectionShell';

/**
 * ⚠️ NO BACKEND. There is no source for a community's places:
 * `/v1/communities/{id}/places/` is a 404, and `?community=` on `/v1/places/`
 * is silently ignored (it returns the full unfiltered list). The community
 * payload carries `verified_places`, but it is empty on every community and its
 * shape is undocumented.
 *
 * The section is rendered as a heading plus an empty state rather than filled
 * with invented cards. Wire it up when the endpoint exists.
 */
export const PlacesSection = ({ communityName }: { communityName: string }) => (
  <SectionShell id="places" title={`Places hosted by ${communityName}`}>
    <div className="py-10">
      <NoData message="Places for a community aren't available yet" />
    </div>
  </SectionShell>
);
