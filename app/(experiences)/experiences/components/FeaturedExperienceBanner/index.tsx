'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';

import { MetaRow } from '../MetaRow';

interface FeaturedExperienceBannerProps {
  experience: Experience;
}

export const FeaturedExperienceBanner = ({ experience }: FeaturedExperienceBannerProps) => {
  const router = useRouter();

  const coverPhoto =
    experience.photos?.find((photo: Photo) => photo.isCover)?.photo ||
    experience.photos?.[0]?.photo;

  const durationMinutes =
    experience.startDate && experience.endDate
      ? moment(experience.endDate).diff(moment(experience.startDate), 'minutes')
      : undefined;

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl md:aspect-[3/1]">
      {coverPhoto ? (
        <Image
          src={coverPhoto}
          alt={experience.title}
          fill
          sizes="(max-width: 768px) 100vw, 1280px"
          className="object-cover"
          priority
        />
      ) : (
        <div className="h-full w-full bg-gray-200" />
      )}

      {/* Dark gradient so the text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

      <div className="absolute bottom-0 left-0 p-6 md:p-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-900">
          <IconComponent iconName="Ticket01Icon" size={14} className="text-gray-900" />
          Featured Experience
        </div>

        <h2 className="mt-4 text-2xl font-bold text-white md:text-4xl">{experience.title}</h2>

        <div className="mt-1">
          <MetaRow
            location={experience.location?.city}
            durationMinutes={durationMinutes}
            className="text-white/80"
          />
        </div>

        <Button
          variant="lime"
          onClick={() => router.push(`/experiences/${experience.id}`)}
          className="mt-5 rounded-full px-6 font-semibold text-gray-900"
        >
          Reserve a spot — {experience.priceStartsFrom?.currency}{' '}
          {experience.priceStartsFrom?.amount.toLocaleString()}
        </Button>
      </div>
    </div>
  );
};
