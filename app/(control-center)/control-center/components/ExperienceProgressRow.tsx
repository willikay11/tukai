import moment from 'moment';

import { PhotoImage } from '@/app/shared/components/Images';
import { Experience } from '@/types/experience';
import { Photo } from '@/types/photo';

import { experienceProgress } from '../utils/studio-metrics';

export const StatusBadge = ({ isSellingFast }: { isSellingFast: boolean }) =>
  isSellingFast ? (
    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      Selling fast
    </span>
  ) : (
    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
      Published
    </span>
  );

export const ProgressBar = ({ percent }: { percent: number }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
    <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
  </div>
);

export const coverOf = (experience: Experience): string | null =>
  experience.photos?.find((photo: Photo) => photo.isCover)?.photo ||
  experience.photos?.[0]?.photo ||
  null;

export const ExperienceProgressRow = ({ experience }: { experience: Experience }) => {
  const { sold, total, percent, isSellingFast } = experienceProgress(experience);
  const cover = coverOf(experience);

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl">
        <PhotoImage src={cover} alt={experience.title} fill sizes="48px" className="object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-gray-900">{experience.title}</p>
        {experience.startDate && (
          <p className="text-xs text-gray-400">
            {moment(experience.startDate).format('ddd D MMMM')} &middot;{' '}
            {moment(experience.startDate).format('h:mm A')}
          </p>
        )}
        <div className="mt-2">
          <ProgressBar percent={percent} />
        </div>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-2">
        <StatusBadge isSellingFast={isSellingFast} />
        <span className="text-xs text-gray-400">
          {sold}/{total} sold
        </span>
      </div>
    </div>
  );
};
