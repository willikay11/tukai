'use client';

import Link from 'next/link';

import clsx from 'clsx';
import { motion } from 'framer-motion';

import { SingleExperience } from '@/app/components/experiences/Single';
import { NoData } from '@/components/ui/noData';
import { useExperiences } from '@/app/shared/hooks/useExperiences';
import { Experience } from '@/types/experience';

export const UpcomingExperiences = ({ category }: { category: string }) => {
  const { data: upcomingExperiences } = useExperiences(
    {
      page: 1,
      page_size: 3,
      category,
    },
    true,
  );

  return (
    <div className="grid grid-cols-12 gap-4 bg-gray-50 py-4">
      <div className="col-span-12 md:col-span-10 md:col-start-2 xl:col-span-6 xl:col-start-4 2xl:col-span-4 2xl:col-start-5">
        <div className="mb-4 inline-flex items-center space-x-2">
          <p className="text-base font-bold text-gray-700">Upcoming Experiences</p>
          {upcomingExperiences?.data?.count != 0 && (
            <>
              <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
              <p className="text-base text-gray-500">{upcomingExperiences?.data?.count}</p>
            </>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={clsx('grid', {
            'grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3':
              upcomingExperiences?.data?.count > 0,
            'grid-cols-1': upcomingExperiences?.data?.count === 0,
          })}
        >
          {upcomingExperiences?.data?.count > 0 ? (
            upcomingExperiences?.data?.results?.map((experience: Experience) => (
              <Link key={experience.id} href={`/experiences/${experience.id}`} target="_blank">
                <SingleExperience key={experience.id} experience={experience} type="invited" />
              </Link>
            ))
          ) : (
            <div className="flex items-center justify-center">
              <NoData message="No upcoming experiences found" />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
