import { NoData } from '@/components/ui/noData';

import { SectionShell } from './SectionShell';

/**
 * ⚠️ NO BACKEND. Communities have no reviews: `/v1/communities/{id}/reviews/`,
 * `/v1/reviews/`, `/v1/community-reviews/` and `/v1/communities/{id}/ratings/`
 * are all 404, and the community payload carries no rating or review count.
 * (Places do have reviews — `/v1/places/{id}/reviews/` — communities do not.)
 *
 * Heading plus empty state, with no rating summary, since there is nothing to
 * summarise.
 */
export const ReviewsSection = ({ communityName }: { communityName: string }) => (
  <SectionShell id="reviews" title="Reviews">
    <div className="py-10">
      <NoData message={`No reviews for ${communityName} yet`} />
    </div>
  </SectionShell>
);
