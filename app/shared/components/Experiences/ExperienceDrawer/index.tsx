'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import {
  experiencePriceLine,
  experienceRunBy,
} from '@/app/(experiences)/components/ExperienceCard/experience-flag';
import { Bookmark } from '@/app/shared/components/Bookmark';
import { IconComponent } from '@/app/shared/components/Icons';
import { ContextMoments } from '@/app/shared/components/Moments';
import { PlacePhotoStrip } from '@/app/shared/components/Places/PlaceDrawer/PlacePhotoStrip';
import { Share } from '@/app/shared/components/Share';
import { useFetchSingleExperience } from '@/app/shared/hooks/useExperiences';
import { Drawer } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { coverPhotoUrl, Photo, photoUrl } from '@/types/photo';
import { formatCardDateTime } from '@/utils/date-utils';
import { experiencePath } from '@/utils/detail-paths';
import { toPlainText } from '@/utils/safe-text-utils';

import { ExperienceDrawerFooter } from './ExperienceDrawerFooter';
import { ExperienceHostSection } from './ExperienceHostSection';
import { ExperienceLocationSection } from './ExperienceLocationSection';
import { ExperienceTicketsSection } from './ExperienceTicketsSection';

/** The round grey disc each of the header's controls sits in. */
const DISC = 'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface';

/**
 * Matches the design's 3-line clamp (`pn.aboutClamp`) rather than
 * `DescriptionShowMore`'s character slice, which cuts mid-sentence and never
 * reaches 3 lines consistently. No `aboutRich`/`aboutBlocks` structure here:
 * the API sends one description string, so the design's structured About
 * blocks (headings, bullets) are not built - see ED-04.
 */
const ABOUT_CLAMP_THRESHOLD = 240;

const AboutClamp = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const plainText = toPlainText(text);
  const shouldTruncate = plainText.length > ABOUT_CLAMP_THRESHOLD;

  return (
    <div className="flex flex-col gap-2">
      <p
        className={cn(
          'whitespace-pre-line text-[15px] leading-relaxed text-brand-ink',
          shouldTruncate && !isExpanded && 'line-clamp-3',
        )}
      >
        {plainText}
      </p>

      {shouldTruncate && (
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          className="inline-flex w-fit items-center gap-1.5 text-[15px] font-medium text-brand hover:underline"
        >
          {isExpanded ? 'Show less' : 'Show more'}
          <IconComponent
            iconName={isExpanded ? 'ArrowUp01Icon' : 'ArrowDown01Icon'}
            size={17}
            color="currentColor"
          />
        </button>
      )}
    </div>
  );
};

/** Cover photo first, same ordering `Experiences/Single` uses for its carousel. */
const galleryPhotos = (photos: Photo[]): string[] =>
  photos
    .filter((photo) => photo.mediaType === 'photo' && photo.photo)
    .sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0))
    .map((photo) => photoUrl(photo, 'md'))
    .filter((url): url is string => Boolean(url));

/** Whether to show the moments section's past-experience note (ED-09). */
const hasEnded = (experience: Experience): boolean => new Date(experience.endDate) < new Date();

const Loading = () => (
  <div className="space-y-4 px-6 py-6">
    <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
    <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-gray-200" />
    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
    <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
  </div>
);

/**
 * An experience, opened over whatever the reader was looking at.
 *
 * The drawer shows what a card promises - who runs it, when, where and what it
 * costs - and what it is about. Booking stays on the experience's own page, so
 * the footer sends the reader there rather than duplicating the booking flow.
 */
export const ExperienceDrawer = ({
  experienceId,
  isOpen,
  onClose,
}: {
  experienceId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { data: session } = useSession();

  const { data, isLoading, isError } = useFetchSingleExperience(
    isOpen && experienceId ? experienceId : '',
  );
  const experience: Experience | undefined = data?.data;

  return (
    <Drawer isOpen={isOpen} setIsOpen={(next) => !next && onClose()} width="wide" mobile="full">
      {isError ? (
        <div className="space-y-4 px-6 py-6">
          <p className="text-base text-ink-muted">This experience could not be loaded.</p>
        </div>
      ) : isLoading || !experience ? (
        <Loading />
      ) : (
        <div className="flex min-h-full flex-col">
          <div className="sticky top-0 z-30 border-b border-line bg-white">
            <div className="flex items-start justify-between gap-4 px-6 py-4">
              <h2 className="min-w-0 truncate text-[26px] font-bold leading-tight text-brand-ink">
                {experience.title}
              </h2>

              <div className="flex flex-shrink-0 items-center gap-2">
                <div className={DISC}>
                  <Share
                    coverPhoto={coverPhotoUrl(experience.photos, 'md') ?? ''}
                    title={experience.title}
                    link={`${process.env.NEXT_PUBLIC_APP_URL}${experiencePath(experience)}`}
                    kind="experience"
                    variant="icon"
                  />
                </div>

                <div className={DISC}>
                  <Bookmark
                    bookmarked={experience.isBookmarked}
                    userId={session?.user?.id}
                    experienceId={experience.id}
                    itemName={experience.title}
                    className="text-brand"
                  />
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label={`Close ${experience.title}`}
                  className={`${DISC} text-danger transition-colors hover:bg-danger-surface`}
                >
                  <IconComponent iconName="Cancel01Icon" size={20} color="currentColor" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6 px-6 py-6">
            <PlacePhotoStrip photos={galleryPhotos(experience.photos)} alt={experience.title} />

            <h2 className="text-[26px] font-bold leading-tight tracking-[-0.5px] text-brand-ink">
              {experience.title}
            </h2>

            <div className="flex flex-col gap-1">
              {experienceRunBy(experience) && (
                <span className="text-sm font-semibold text-brand">
                  {experienceRunBy(experience)}
                </span>
              )}

              {formatCardDateTime(experience.startDate, experience.endDate) && (
                <p className="text-[15px] text-ink-muted">
                  {formatCardDateTime(experience.startDate, experience.endDate)}
                </p>
              )}

              {experience.location?.city && (
                <p className="flex items-center gap-1.5 text-[15px] text-ink-muted">
                  <IconComponent
                    iconName="Location01Icon"
                    size={16}
                    color="currentColor"
                    className="text-brand"
                  />
                  {experience.location.city}
                </p>
              )}

              {experiencePriceLine(experience) && (
                <p className="mt-1 text-base font-semibold text-gray-800">
                  {experiencePriceLine(experience)}
                </p>
              )}
            </div>

            {experience.description && <AboutClamp text={experience.description} />}

            <ExperienceTicketsSection experience={experience} />

            <ExperienceLocationSection experience={experience} />

            <ExperienceHostSection experience={experience} />

            <div className="space-y-4 border-t border-line pt-6">
              {hasEnded(experience) && (
                <p className="text-[14px] text-ink-muted">This experience has already happened.</p>
              )}
              <ContextMoments
                title="Moments"
                contextLabel={experience.title}
                emptyMessage={`No moments from ${experience.title} yet. Yours could be the first.`}
                experienceId={experience.id}
                placeId={experience.place?.id}
                placeLabel={experience.place?.title}
                communityId={experience.hostCommunity?.id}
                communityLabel={experience.hostCommunity?.title}
              />
            </div>
          </div>

          <ExperienceDrawerFooter experience={experience} />
        </div>
      )}
    </Drawer>
  );
};
