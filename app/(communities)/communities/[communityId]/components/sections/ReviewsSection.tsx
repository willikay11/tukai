'use client';

import { reviewSummary } from '@/app/shared/components/Communities/CommunityDrawer/community-drawer';
import { Avatar } from '@/app/shared/components/Communities/CommunityDrawer/parts';
import { IconComponent } from '@/app/shared/components/Icons';
import { SectionShell } from '@/app/shared/components/Sections';
import { useCommunityRatingSummary, useCommunityRatings } from '@/app/shared/hooks/useCommunities';
import { NoData } from '@/components/ui/noData';
import { CommunityRating, CommunityRatingSummary } from '@/types/community';

const monthOf = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

const authorOf = (rating: CommunityRating) =>
  rating.attendee?.displayName ||
  `${rating.attendee?.firstName ?? ''} ${rating.attendee?.lastName ?? ''}`.trim() ||
  'A guest';

const Dot = () => <span aria-hidden className="h-1 w-1 flex-none rounded-full bg-gray-300" />;

/**
 * Reviews of the experiences this community has run: the average and count
 * across all of them (`ratings/summary/`, DEV-383), then the newest few.
 */
export const ReviewsSection = ({
  communityId,
  communityName,
  experienceTitles,
}: {
  communityId: string;
  communityName: string;
  /** A rating names its experience by id only; the page holds the titles it loaded. */
  experienceTitles?: Map<string, string>;
}) => {
  const { data: ratingsResponse, isLoading } = useCommunityRatings(communityId, true);
  const { data: summaryResponse } = useCommunityRatingSummary(communityId, true);

  const ratings: CommunityRating[] = ratingsResponse?.success
    ? (ratingsResponse.data?.results ?? [])
    : [];
  const summary: CommunityRatingSummary | null = summaryResponse?.success
    ? summaryResponse.data
    : null;
  const { count, average, newest } = reviewSummary(ratings, ratingsResponse?.data?.count, summary);

  const subtitle =
    count > 0 ? (
      <span className="inline-flex items-center gap-1.5 text-gray-800">
        <IconComponent
          iconName="StarIcon"
          variant="bulk"
          size={16}
          color="currentColor"
          className="text-rating"
        />
        <span className="font-semibold">{average.toFixed(1)}</span>
        <Dot />
        {count} {count === 1 ? 'review' : 'reviews'}
      </span>
    ) : undefined;

  return (
    <SectionShell id="reviews" title="Reviews" subtitle={subtitle}>
      {isLoading ? (
        <div className="space-y-3" aria-label="Loading reviews">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : newest.length === 0 ? (
        <div className="py-10">
          <NoData message={`No reviews for ${communityName} yet`} />
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {newest.map((rating) => {
            const author = authorOf(rating);
            const subject = experienceTitles?.get(rating.experience);

            return (
              <article key={rating.id} className="flex items-start gap-3 py-4">
                <Avatar src={rating.attendee?.picture} name={author} size={40} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex min-w-0 items-center gap-1.5 text-sm text-gray-900">
                    <span className="flex-none font-semibold">{author}</span>
                    {subject && (
                      <>
                        <Dot />
                        <span className="min-w-0 truncate">{subject}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <IconComponent
                      iconName="StarIcon"
                      variant="bulk"
                      size={14}
                      color="currentColor"
                      className="text-rating"
                    />
                    <span className="text-gray-800">{rating.rating}</span>
                    <Dot />
                    {monthOf(rating.dateCreated)}
                  </div>
                  {rating.review && (
                    <p className="mt-1 text-sm leading-relaxed text-gray-700 [text-wrap:pretty]">
                      {rating.review}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
};
