import Link from 'next/link';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { NoData } from '@/components/ui/noData';
import { Experience } from '@/types/experience';

import { experienceProgress } from '../utils/studio-metrics';
import { ProgressBar, StatusBadge, coverOf } from './ExperienceProgressRow';

export const MyExperiences = ({ experiences }: { experiences: Experience[] }) => (
  <section>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-bold text-gray-900">My Experiences</h2>
      {/* No "View all": the studio already lists every published experience,
          and the /experiences hosting tab this used to link to was removed */}
      <span className="flex-shrink-0 text-sm text-gray-400">{experiences.length} published</span>
    </div>

    {experiences.length === 0 ? (
      <div className="mt-4 rounded-2xl border border-dashed border-gray-200 py-12">
        <NoData message="You have no published experiences yet" />
      </div>
    ) : (
      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {experiences.map((experience) => {
          const { sold, total, percent, isSellingFast } = experienceProgress(experience);
          const cover = coverOf(experience);

          return (
            <div
              key={experience.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="relative aspect-[16/10] w-full">
                <PhotoImage
                  src={cover}
                  alt={experience.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
                <div className="absolute left-3 top-3">
                  <StatusBadge isSellingFast={isSellingFast} />
                </div>
              </div>

              <div className="p-4">
                <p className="truncate font-bold text-gray-900">{experience.title}</p>
                {experience.startDate && (
                  <p className="mt-0.5 text-sm text-gray-400">
                    {moment(experience.startDate).format('ddd D MMM YYYY')} &middot;{' '}
                    {moment(experience.startDate).format('h:mm A')}
                  </p>
                )}

                <div className="mt-3">
                  <ProgressBar percent={percent} />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <IconComponent iconName="Ticket01Icon" size={15} className="text-gray-400" />
                    {sold}/{total} sold
                  </span>
                  <Link
                    href={`/creator-studio/experiences/${experience.id}`}
                    className="flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-primary"
                  >
                    Manage
                    <IconComponent iconName="ArrowRight01Icon" size={14} color="currentColor" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </section>
);
