'use client';

import Link from 'next/link';

import numeral from 'numeral';

import { PhotoImage } from '@/app/shared/components/Images';
import { Button } from '@/components/ui/button';
import { NoData } from '@/components/ui/noData';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';
import { formatFirstExperienceDate } from '@/utils/date-utils';

import { SectionShell } from './SectionShell';

const ExperienceRow = ({ experience }: { experience: Experience }) => {
  const cover =
    experience.photos?.find((photo: Photo) => photo.isCover)?.photo ||
    experience.photos?.[0]?.photo;
  const price = experience.priceStartsFrom;

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-gray-50 p-3">
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
        <PhotoImage src={cover} alt={experience.title} fill sizes="64px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-gray-900">{experience.title}</p>
        <p className="mt-0.5 truncate text-sm text-gray-400">
          {price ? `From ${price.currency} ${numeral(price.amount).format('0,0')}` : 'Free'}
          {experience.startDate ? ` | ${formatFirstExperienceDate(experience.startDate)}` : ''}
        </p>
      </div>

      {/* Straight to the experience page, which owns the existing booking flow —
          no second checkout entry point */}
      <Button asChild size="sm" className="flex-shrink-0 rounded-full px-5">
        <Link href={`/experiences/${experience.id}`}>Buy Tickets</Link>
      </Button>
    </div>
  );
};

export const UpcomingExperiencesSection = ({
  hostName,
  experiences,
  isLoading,
}: {
  // Whoever hosts them — a community, or a place
  hostName: string;
  experiences: Experience[];
  isLoading: boolean;
}) => (
  <SectionShell id="experiences" title="Upcoming Experiences" subtitle={`Hosted by ${hostName}`}>
    {isLoading ? (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="h-[88px] animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    ) : experiences.length === 0 ? (
      <div className="py-10">
        <NoData message={`${hostName} has no upcoming experiences`} />
      </div>
    ) : (
      <div className="space-y-3">
        {experiences.map((experience) => (
          <ExperienceRow key={experience.id} experience={experience} />
        ))}
      </div>
    )}
  </SectionShell>
);
