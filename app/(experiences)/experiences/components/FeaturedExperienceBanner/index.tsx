'use client';

import { useRouter } from 'next/navigation';

import moment from 'moment';

import { FeaturedBanner } from '@/app/shared/components/Banners';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';

interface FeaturedExperienceBannerProps {
  experience: Experience;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

export const FeaturedExperienceBanner = ({ experience }: FeaturedExperienceBannerProps) => {
  const router = useRouter();

  const coverPhoto =
    experience.photos?.find((photo: Photo) => photo.isCover)?.photo ||
    experience.photos?.[0]?.photo ||
    null;

  const durationMinutes =
    experience.startDate && experience.endDate
      ? moment(experience.endDate).diff(moment(experience.startDate), 'minutes')
      : 0;

  const metaItems = [
    experience.location?.city,
    durationMinutes > 0 ? formatDuration(durationMinutes) : null,
  ].filter(Boolean) as string[];

  return (
    <FeaturedBanner
      badgeLabel="Featured Experience"
      badgeIcon="Ticket01Icon"
      coverPhoto={coverPhoto}
      title={experience.title}
      metaItems={metaItems}
      ctaLabel={`Reserve a spot — ${experience.priceStartsFrom?.currency} ${experience.priceStartsFrom?.amount.toLocaleString()}`}
      onCtaClick={() => router.push(`/experiences/${experience.id}`)}
    />
  );
};
