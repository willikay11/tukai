'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { useToast } from '@/app/shared/hooks/useToast';
import { cn } from '@/lib/utils';
import { CommunityRating } from '@/types/community';
import { photoUrl } from '@/types/photo';

import { SectionLinkTitle } from './CommunityPlaces';
import { reviewSummary } from './community-drawer';
import { Avatar } from './parts';
import { COMMUNITY_SECTIONS, SECTION_SCROLL_MARGIN } from './tabs';

const Dot = () => (
  <span aria-hidden className="h-[5px] w-[5px] flex-none rounded-full bg-distance" />
);

const monthOf = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

const authorOf = (rating: CommunityRating) =>
  rating.attendee?.displayName ||
  `${rating.attendee?.firstName ?? ''} ${rating.attendee?.lastName ?? ''}`.trim() ||
  'A guest';

/**
 * Reviews of the community's past experiences: the average and count, then
 * the newest four.
 *
 * ⚠️ Like, Comment and More are left off: the ratings endpoint has no likes or
 * replies to drive them. Review photos are not buttons - there is no photo
 * viewer to open yet.
 */
export const CommunityReviews = ({
  communityTitle,
  ratings,
  total,
  experienceTitles,
}: {
  communityTitle: string;
  ratings: CommunityRating[];
  total: number;
  /** A rating names its experience by id only; the drawer already holds the titles. */
  experienceTitles: Map<string, string>;
}) => {
  const { toast } = useToast();
  const { count, average, newest } = reviewSummary(ratings, total);

  return (
    <section id={COMMUNITY_SECTIONS.reviews} className={cn('flex flex-col', SECTION_SCROLL_MARGIN)}>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <SectionLinkTitle
          label="Reviews"
          onClick={() =>
            toast({
              description: `Opens all ${count} reviews of experiences run by ${communityTitle}.`,
            })
          }
        />
        {count > 0 && (
          <span className="inline-flex items-center gap-[7px] whitespace-nowrap text-[14.5px] text-gray-800">
            <IconComponent
              iconName="StarIcon"
              variant="bulk"
              size={18}
              color="currentColor"
              className="text-rating"
            />
            <span className="font-semibold">{average.toFixed(1)}</span>
            <Dot />
            {count} {count === 1 ? 'review' : 'reviews'}
          </span>
        )}
      </div>

      {newest.length === 0 ? (
        <p className="mt-2 text-[14.5px] leading-normal text-ink-muted">
          No reviews yet. If you have been, yours would be the first.
        </p>
      ) : (
        newest.map((rating, index) => {
          const author = authorOf(rating);
          const subject = experienceTitles.get(rating.experience);
          const photos = (rating.photos ?? [])
            .map((photo) => photoUrl(photo, 'md'))
            .filter((url): url is string => Boolean(url));

          return (
            <article
              key={rating.id}
              className={cn(
                '-mx-6 flex items-start gap-3.5 border-t px-6 py-[18px]',
                index === 0 ? 'border-transparent' : 'border-gray-200',
              )}
            >
              <Avatar src={rating.attendee?.picture} name={author} size={48} />

              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex min-w-0 items-center gap-[7px] text-[15.5px] text-gray-800">
                    <span className="flex-none font-semibold">{author}</span>
                    {subject && (
                      <>
                        <Dot />
                        <span className="min-w-0 truncate">{subject}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[13.5px] text-ink-muted">
                    <IconComponent
                      iconName="StarIcon"
                      variant="bulk"
                      size={16}
                      color="currentColor"
                      className="text-rating"
                    />
                    <span className="text-gray-800">{rating.rating}</span>
                    <Dot />
                    {monthOf(rating.dateCreated)}
                  </div>
                </div>

                {rating.review && (
                  <p className="text-[15px] leading-[1.55] text-gray-800 [text-wrap:pretty]">
                    {rating.review}
                  </p>
                )}

                {photos.length > 0 && (
                  <div className="-mr-6 flex gap-2.5 overflow-x-auto pr-6 scrollbar-hide">
                    {photos.map((photo, photoIndex) => (
                      <div
                        key={photo}
                        className="relative h-[150px] w-[150px] flex-none overflow-hidden rounded-xl bg-surface-brand"
                      >
                        <PhotoImage
                          src={photo}
                          alt={`Photo ${photoIndex + 1} from ${author}`}
                          fill
                          sizes="150px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })
      )}
    </section>
  );
};
