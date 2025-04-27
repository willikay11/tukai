'use client';

import IconComponent from '@/app/components/iconComponent';
import NoData from '@/components/ui/noData';
import { useInterestBasedCommunities } from '@/hooks/communities';
import { Community } from '@/types/community';
import { Interest } from '@/types/interest';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import SingleCommunity from './community';

export default function InterestBasedCommunities({ interest, color }: { interest: Interest, color: {bg: string, color: string} }) {
  const {
    data: communities,
    isLoading,
    error,
  } = useInterestBasedCommunities({ page: 1, enabled: true, category: interest.id });

  if (!isLoading && communities?.data.results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <NoData message="No communities found" />
      </motion.div>
    );
  }

  return (
    <div className="mb-2.5">
      <div className="inline-flex items-center gap-2 mb-4">
        <div className="inline-flex items-center gap-2">
          {interest.icon && (
            <div className={`rounded-full ${color.bg} p-2`}>
              <IconComponent iconName={interest.icon} size={18} color={color.color} />
            </div>
          )}
          <div className="flex flex-col">
            <span className={clsx('text-nowrap text-sm font-bold text-gray-700')}>
              {interest.name}
            </span>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6"
      >
        {communities?.data.results.map((community: Community) => (
          <SingleCommunity key={community.id} community={community} />
        ))}
      </motion.div>
    </div>
  );
}
