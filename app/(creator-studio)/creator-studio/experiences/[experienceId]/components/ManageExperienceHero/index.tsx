'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { Share } from '@/app/shared/components/Share';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';

import { ManageExperienceMetrics } from '../../utils/manage-metrics';

interface ManageExperienceHeroProps {
  experience: Experience;
  metrics: ManageExperienceMetrics;
}

const HeroStat = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="truncate text-lg font-bold text-white">{value}</p>
    <p className="mt-0.5 truncate text-xs text-white/60">{label}</p>
  </div>
);

export const ManageExperienceHero = ({ experience, metrics }: ManageExperienceHeroProps) => {
  const coverPhoto =
    experience.photos?.find((photo: Photo) => photo.isCover)?.photo ||
    experience.photos?.[0]?.photo;

  const start = experience.startDate ? moment(experience.startDate) : null;
  const end = experience.endDate ? moment(experience.endDate) : null;

  const dateLine = start?.isValid()
    ? [
        start.format('ddd D MMM YYYY'),
        end?.isValid() ? `${start.format('h:mm A')} — ${end.format('h:mm A')}` : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  const locationLine = [experience.location?.city, experience.location?.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <PhotoImage
        src={coverPhoto}
        alt={experience.title}
        fill
        sizes="(max-width: 1024px) 100vw, 1024px"
        className="object-cover"
        // Dark rather than the usual light ground: the hero's copy is white
        // and sits over this
        fallbackClassName="bg-gray-800 text-gray-600"
      />

      {/* Overlay keeps the white copy legible over any cover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/40" />

      <div className="relative flex min-h-[340px] flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-lime px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {experience.status}
            </span>
            {metrics.isSelling && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                Live · selling
              </span>
            )}
          </div>

          <div className="flex-shrink-0">
            <Share
              coverPhoto={coverPhoto ?? ''}
              title={experience.title}
              link={`${process.env.NEXT_PUBLIC_APP_URL}/experiences/${experience.id}`}
            />
          </div>
        </div>

        <div className="mt-8">
          <h1 className="text-3xl font-bold text-white">{experience.title}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
            {dateLine && <span>{dateLine}</span>}
            {locationLine && (
              <span className="inline-flex items-center gap-1.5">
                <IconComponent iconName="Location01Icon" size={14} color="currentColor" />
                {locationLine}
              </span>
            )}
          </div>

          {/* Stat strip */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm sm:grid-cols-4">
            <HeroStat label="Revenue" value={metrics.revenueLabel} />
            <HeroStat
              label="Tickets sold"
              value={`${metrics.ticketsSold}/${metrics.ticketsTotal}`}
            />
            <HeroStat label="Buyers" value={String(metrics.buyers)} />
            <HeroStat label="Fill rate" value={`${metrics.fillRatePercent}%`} />
          </div>
        </div>
      </div>
    </div>
  );
};
