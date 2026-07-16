'use client';

import moment from 'moment';

import { DescriptionShowMore } from '@/app/shared/components/Global';
import { IconComponent } from '@/app/shared/components/Icons';
import { SquarePhotoStrip } from '@/app/shared/components/Images/SquarePhotoStrip';
import { Share } from '@/app/shared/components/Share';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import { inferUIExperienceType } from '@/utils/date-utils';

import { BackToExplore } from '../components/BackToExplore';
import { BookingPanel } from '../components/BookingPanel';
import { BucketListButton } from '../components/BucketListButton';
import { ExperienceTypeBadge } from '../components/ExperienceTypeBadge';
import { HostCommunityCard } from '../components/HostCommunityCard';
import { IncludedExcludedSection } from '../components/IncludedExcludedSection';
import { LocationMeetingSection } from '../components/LocationMeetingSection';
import { MetaRow } from '../components/MetaRow';
import { ExperienceOrganiser } from '../components/experienceOrganiser';

interface ViewExperiencePageContentProps {
  experience: Experience;
}

export const ViewExperiencePageContent = ({ experience }: ViewExperiencePageContentProps) => {
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
    <main className="mx-auto max-w-6xl px-4 py-6">
      {/* Top row — Back link on left, actions on right */}
      <div className="mb-6 flex items-center justify-between">
        <BackToExplore />

        <div className="flex items-center gap-2">
          <BucketListButton experienceId={experience.id} isBookmarked={experience.isBookmarked} />
          <Share
            coverPhoto={
              experience.photos?.find((photo: Photo) => photo.isCover)?.photo ||
              experience.photos[0].photo
            }
            title={experience.title}
            link={`${process.env.NEXT_PUBLIC_APP_URL}/experiences/${experience.id}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left column: Main content */}
        <div className="col-span-12 space-y-6 lg:col-span-7">
          {/* Hero with badge */}
          <div className="relative">
            <SquarePhotoStrip
              photos={experience.photos
                .sort((a, b) => Number(b.isCover) - Number(a.isCover))
                .map((p) => p.photo)}
              variant="hero"
            />
            <ExperienceTypeBadge type={badgeType} className="absolute left-4 top-4 z-10" />
          </div>

          {/* Title */}
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">{experience.title}</h1>
            <MetaRow
              location={`${experience.location.city}, ${experience.location.country}`}
              durationMinutes={
                experience.startDate && experience.endDate
                  ? moment(experience.endDate).diff(moment(experience.startDate), 'minutes')
                  : undefined
              }
            />
          </div>

          {/* Host card */}
          <div>
            <ExperienceOrganiser experience={experience} />
          </div>

          {/* Description */}
          <div>
            <p className="mb-3 text-base font-bold text-gray-900">About</p>
            <DescriptionShowMore
              text={experience.description}
              photo={
                experience.photos.find((photo: Photo) => photo.isCover)?.photo ||
                experience.photos[0].photo
              }
            />
          </div>

          {/* Categories */}
          {experience.categories.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {experience.categories.map((category) => (
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

          {/* Included/Excluded */}
          {(experience.whatsIncluded || experience.whatsNotIncluded) && (
            <>
              <IncludedExcludedSection
                included={experience.whatsIncluded}
                excluded={experience.whatsNotIncluded}
              />
              <Separator />
            </>
          )}

          {/* Location and Meeting Point */}
          <LocationMeetingSection experience={experience} />

          {/* Host Community */}
          {experience.hostCommunity && (
            <>
              <Separator />
              <HostCommunityCard community={experience.hostCommunity} />
            </>
          )}

          <Separator />

          {/* Cancellation Policy */}
          <div>
            <p className="mb-2 text-base font-bold text-gray-900">Cancellation Policy</p>
            <p className="text-xs font-medium text-gray-600">
              Ticket sales close {closingDuration} {closingUnit} {closingConditionText}
            </p>
          </div>

          <Separator />

          {/* Report */}
          <Button variant="text" className="justify-start">
            <IconComponent iconName="Flag02Icon" color="red" size={18} />
            Report this experience
          </Button>
        </div>

        {/* Right column: Sticky booking panel */}
        <div className="col-span-12 lg:col-span-5">
          <div className="sticky top-16">
            <BookingPanel experience={experience} />
          </div>
        </div>
      </div>
    </main>
  );
};
