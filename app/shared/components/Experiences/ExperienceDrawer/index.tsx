'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

import {
  experiencePriceLine,
  experienceRunBy,
} from '@/app/(experiences)/components/ExperienceCard/experience-flag';
import { Bookmark } from '@/app/shared/components/Bookmark';
import { DescriptionShowMore } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Share } from '@/app/shared/components/Share';
import { useFetchSingleExperience } from '@/app/shared/hooks/useExperiences';
import { Drawer } from '@/components/ui/drawer';
import { Experience } from '@/types/experience';
import { coverPhotoUrl } from '@/types/photo';
import { formatCardDateTime } from '@/utils/date-utils';
import { experiencePath } from '@/utils/detail-paths';

/** The round grey disc each of the header's controls sits in. */
const DISC = 'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface';

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
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
              <PhotoImage
                src={coverPhotoUrl(experience.photos, 'md')}
                alt={experience.title}
                fill
                sizes="(min-width: 720px) 720px, 100vw"
                className="object-cover"
              />
            </div>

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

            {experience.description && (
              <DescriptionShowMore text={experience.description} maxLength={240} />
            )}
          </div>

          <div className="sticky bottom-0 z-30 border-t border-line bg-white px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <Link
              href={experiencePath(experience)}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-lime text-[15px] font-bold text-brand-ink transition-colors hover:bg-lime-dark"
            >
              View experience
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  );
};
