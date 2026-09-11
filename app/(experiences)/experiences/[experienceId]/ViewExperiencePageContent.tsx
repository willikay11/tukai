'use client';

import moment from 'moment';

import { DescriptionShowMore } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { SquarePhotoStrip } from '@/app/shared/components/Images/SquarePhotoStrip';
import { PageContainer } from '@/app/shared/components/Layout';
import { RevealOnScroll, useHasScrolled } from '@/app/shared/components/Motion';
import { Share } from '@/app/shared/components/Share';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import {
  formatFirstExperienceDate,
  formatItineraryDateRange,
  inferUIExperienceType,
} from '@/utils/date-utils';
import { experiencePath } from '@/utils/detail-paths';

import { BackToExplore } from '../components/BackToExplore';
import { BookingPanel } from '../components/BookingPanel';
import { BucketListButton } from '../components/BucketListButton';
import { ExperienceTypeBadge } from '../components/ExperienceTypeBadge';
import { HostCommunityCard } from '../components/HostCommunityCard';
import { IncludedExcludedSection } from '../components/IncludedExcludedSection';
import { ItineraryDayByDay } from '../components/ItineraryDayByDay';
import { LocationMeetingSection } from '../components/LocationMeetingSection';
import { MetaRow } from '../components/MetaRow';
import { MobileBookingBar } from '../components/MobileBookingBar';
import { ExperienceOrganiser } from '../components/experienceOrganiser';

/**
 * SINGLE SOURCE OF TRUTH for the experience detail view.
 *
 * Rendered by BOTH:
 *   - the live customer page  /experiences/[experienceId]  (bookingMode 'live')
 *   - the create-flow Preview step                          (bookingMode 'preview')
 *
 * The preview feeds it a form-derived Experience via buildPreviewExperience
 * (utils/preview-utils.ts) instead of a fetched one. Do NOT create a
 * preview-specific copy of any section below — edit it here and both surfaces
 * change together. The only permitted divergence is behaviour keyed off
 * `bookingMode`, never layout.
 *
 * It is presentational: it does not fetch the experience. (Children still do
 * their own I/O — BookingPanel loads occurrences, BucketListButton mutates
 * bookmarks — which is why both take a preview mode.)
 */
interface ViewExperiencePageContentProps {
  experience: Experience;
  // 'preview' keeps the full layout but blocks purchase and bookmarking. It
  // also drops the "Back to Explore" link, which is meaningless mid-create —
  // BackToExplore owns its own router.back(), so there is no onBack to thread.
  bookingMode?: 'live' | 'preview';
}

export const ViewExperiencePageContent = ({
  experience,
  bookingMode = 'live',
}: ViewExperiencePageContentProps) => {
  const isPreview = bookingMode === 'preview';
  // Only the customer view scrolls under its own header
  const isPanelLifted = useHasScrolled(200, !isPreview);

  // A form-derived experience can be missing anything the user has not filled
  // in yet, so every read below is guarded. Live data always populates these.
  const photos = experience.photos ?? [];
  // Copy before sorting — sort() mutates, and in preview this array belongs to
  // a memoised object that would be reordered on every render
  const sortedPhotos = [...photos].sort((a, b) => Number(b.isCover) - Number(a.isCover));
  const coverPhoto = photos.find((photo: Photo) => photo.isCover)?.photo || photos[0]?.photo || '';
  const categories = experience.categories ?? [];
  const locationLabel = [experience.location?.city, experience.location?.country]
    .filter(Boolean)
    .join(', ');

  // The meta row shows WHEN the experience runs rather than how long it lasts.
  // A run spanning more than one calendar day (multi-day, itinerary, or a
  // recurring window) shows the span; a single day shows its weekday.
  const experienceDay = (() => {
    const start = experience.startDate ? moment(experience.startDate) : null;
    if (!start?.isValid()) return undefined;

    const end = experience.endDate ? moment(experience.endDate) : null;
    if (end?.isValid() && !end.isSame(start, 'day')) {
      return formatItineraryDateRange(experience.startDate, experience.endDate);
    }

    return formatFirstExperienceDate(experience.startDate);
  })();

  // Recurring is checked first: inferUIExperienceType folds recurring into the
  // 'one-time' base type, and a recurring experience's start/end span would
  // otherwise read as multi-day
  const badgeType = experience.recurrenceRule
    ? 'recurring'
    : inferUIExperienceType(
        experience.experienceType || 'standard',
        experience.startDate ?? null,
        experience.endDate ?? null,
      );

  const closingDuration = experience?.ticketSalesClosingDuration;
  const closingUnitRaw = experience?.ticketSalesClosingUnit ?? '';
  const closingUnit =
    closingDuration === 1 && closingUnitRaw.endsWith('s')
      ? closingUnitRaw.slice(0, -1)
      : closingUnitRaw;
  const closingConditionText =
    experience?.ticketSalesClosingCondition === 'before_start'
      ? 'before the experience starts.'
      : 'before the experience ends.';

  return (
    <PageContainer variant="detail" className="py-6">
      {/* Top row — Back link on left, actions on right */}
      <div className="mb-6 flex items-center justify-between">
        {isPreview ? <div /> : <BackToExplore />}

        <div className="flex items-center gap-2">
          <BucketListButton
            experienceId={experience.id}
            experienceTitle={experience.title}
            isBookmarked={experience.isBookmarked}
            // Visible but inert in preview, so the creator sees the real chrome
            inert={isPreview}
          />
          <Share
            coverPhoto={coverPhoto}
            title={experience.title}
            link={`${process.env.NEXT_PUBLIC_APP_URL}${experiencePath(experience)}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column: Main content */}
        <div className="col-span-12 space-y-6 lg:col-span-7">
          {/* Hero with badge */}
          <div className="relative">
            <SquarePhotoStrip
              photos={sortedPhotos.map((p) => p.photo).filter((p): p is string => Boolean(p))}
              variant="hero"
            />
            <ExperienceTypeBadge type={badgeType} className="absolute left-4 top-4 z-10" />
          </div>

          {/* Title */}
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{experience.title}</h1>
            <MetaRow location={locationLabel} date={experienceDay} />
          </div>

          {/* Host card */}
          <div>
            <ExperienceOrganiser experience={experience} />
          </div>

          {/* Description */}
          <div>
            <p className="mb-3 text-xl font-bold text-gray-900">About</p>
            <DescriptionShowMore text={experience.description} />
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div
                    className="inline-flex w-fit rounded-full bg-gray-100 px-4 py-2"
                    key={category.id}
                  >
                    <div className="inline-flex items-center gap-2">
                      <IconComponent
                        iconName={category.icon as string}
                        size={16}
                        color="gray-700"
                      />
                      <p className="text-sm text-gray-700">{category.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Day by day — renders only when the experience has itinerary days */}
          <RevealOnScroll>
            <ItineraryDayByDay experienceId={experience.id} startDate={experience.startDate} />
          </RevealOnScroll>

          {/* Included/Excluded */}
          {(experience.whatsIncluded || experience.whatsNotIncluded) && (
            <>
              <RevealOnScroll>
                <IncludedExcludedSection
                  included={experience.whatsIncluded}
                  excluded={experience.whatsNotIncluded}
                />
              </RevealOnScroll>
              <Separator />
            </>
          )}

          {/* Location and Meeting Point */}
          <RevealOnScroll>
            <LocationMeetingSection experience={experience} />
          </RevealOnScroll>

          {/* Host Community */}
          {experience.hostCommunity && (
            <>
              <Separator />
              <RevealOnScroll>
                <HostCommunityCard community={experience.hostCommunity} />
              </RevealOnScroll>
            </>
          )}

          <Separator />

          {/* Cancellation Policy */}
          <RevealOnScroll>
            <p className="mb-2 text-xl font-bold text-gray-900">Cancellation Policy</p>
            <p className="text-sm leading-relaxed text-gray-600">
              Ticket sales close {closingDuration} {closingUnit} {closingConditionText}
            </p>
          </RevealOnScroll>

          <Separator />

          {/* Report */}
          <Button variant="text" className="justify-start">
            <IconComponent iconName="Flag02Icon" color="red" size={18} />
            Report this experience
          </Button>
        </div>

        {!isPreview && <MobileBookingBar experience={experience} />}

        {/* Right column: Sticky booking panel.
            Hidden below lg — there it would stack after every section, which is
            what the floating bar and its sheet replace. */}
        <div className="hidden lg:col-span-5 lg:block">
          {/* Sticky for customers, static in the preview — there the create
              flow's own sticky header owns the top of the viewport.

              The shadow arrives once the reader has scrolled, so the panel
              reads as lifting off the page rather than carrying a shadow it
              never earned. `drop-shadow` follows the panel's rounded shape;
              `shadow` would draw a rectangle around this transparent wrapper. */}
          <div
            className={cn(
              !isPreview && 'sticky top-16 transition duration-300 motion-reduce:transition-none',
              !isPreview && isPanelLifted && 'drop-shadow-xl',
            )}
          >
            <BookingPanel experience={experience} mode={bookingMode} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
