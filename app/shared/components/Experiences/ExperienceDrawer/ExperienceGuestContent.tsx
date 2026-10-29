'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { ContextMoments } from '@/app/shared/components/Moments';
import { PlacePhotoStrip } from '@/app/shared/components/Places/PlaceDrawer/PlacePhotoStrip';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { Photo, photoUrl } from '@/types/photo';
import { toPlainText } from '@/utils/safe-text-utils';

import { ExperienceCancellationSection } from './ExperienceCancellationSection';
import { ExperienceHostSection } from './ExperienceHostSection';
import { ExperienceItinerarySection } from './ExperienceItinerarySection';
import { ExperienceLocationSection } from './ExperienceLocationSection';
import { ExperienceMyTickets } from './ExperienceMyTickets';
import { ExperienceTicketsSection } from './ExperienceTicketsSection';
import { EXPERIENCE_SECTIONS } from './tabs';

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

/**
 * What a guest sees in the drawer: who runs it, when, where and what it
 * costs, and what it is about. Shared with host mode's About tab (ED-host) -
 * the host's own experience, exactly as everyone else sees it.
 */
export const ExperienceGuestContent = ({ experience }: { experience: Experience }) => (
  <div className="flex-1 space-y-6 px-6 py-6">
    <section id={EXPERIENCE_SECTIONS.about} className="scroll-mt-[156px] space-y-6">
      <PlacePhotoStrip photos={galleryPhotos(experience.photos)} alt={experience.title} />

      <div className="space-y-2">
        <h2 className="text-[26px] font-bold leading-tight tracking-[-0.5px] text-brand-ink">
          {experience.title}
        </h2>

        {experience.description && <AboutClamp text={experience.description} />}
      </div>
    </section>

    <ExperienceItinerarySection experience={experience} />

    <ExperienceMyTickets experience={experience} />

    <ExperienceTicketsSection experience={experience} />

    <ExperienceLocationSection experience={experience} />

    <ExperienceHostSection experience={experience} />

    <section
      id={EXPERIENCE_SECTIONS.moments}
      className="scroll-mt-[156px] space-y-4 border-t border-line pt-6"
    >
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
    </section>

    <ExperienceCancellationSection experience={experience} />
  </div>
);
