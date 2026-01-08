'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';

import { useGetCommunities } from '@/hooks/communities';

import SingleExperience from '@/app/components/experiences/Single';
import { Experience } from '@/types/experience';
import { useExperiences } from '@/hooks/experiences';

export default function UpcomingExperiences({ category }: { category: string }) {
  const { data: upcomingExperiences } = useExperiences({
    page: 1,
    category,
  }, true);

  console.log(upcomingExperiences);

  return (
    <div className="grid grid-cols-12 gap-4 bg-gray-50 py-4">
      <div className="col-span-12 md:col-span-7 md:col-start-4 2xl:col-span-4 2xl:col-start-5">
        <div className="mb-4 inline-flex items-center space-x-2">
          <p className="text-base font-bold text-gray-700">Upcoming Experiences</p>
          <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
          <p className="text-base text-gray-500">{upcomingExperiences?.data?.count}</p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3"
        >
          {upcomingExperiences?.data?.results?.map((experience: Experience) => (
            <Link href={`/experiences/${experience.id}`} target="_blank">
              <SingleExperience
                key={experience.id}
                experience={experience}
                type='discover'
              />
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
