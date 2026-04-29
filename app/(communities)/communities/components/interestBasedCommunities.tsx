'use client';
import { useMemo } from 'react';

import Link from 'next/link';

import clsx from 'clsx';
import { motion } from 'framer-motion';

import { NoData } from '@/components/ui/noData';
import { Status } from '@/enums/status';
import { useGetCommunities } from '@/app/shared/hooks/useCommunities';
import { Community } from '@/types/community';

import { SingleCommunity } from './community';

const ITEMS_PER_PAGE = 6;

const placeholders: Community[] = Array.from({ length: ITEMS_PER_PAGE }, (_, index) => ({
  id: `placeholder-${index}`,
  title: 'Loading...',
  description: '',
  coverPhoto: '',
  membersCount: 0,
  status: 'DRAFT' as Status,
  dateCreated: '',
  isJoined: false,
}));

export const InterestBasedCommunities = ({ category }: { category?: string[] }) => {
  if (category === undefined || category.length === 0) return null;

  const {
    data: communities,
    isLoading,
    error,
  } = useGetCommunities({ page: 1, enabled: true, category });

  const communityList = useMemo(() => {
    if (isLoading) {
      return placeholders;
    }
    return communities?.data?.results || [];
  }, [communities, isLoading]);

  if (!isLoading && communityList.length === 0) {
    return null;
  }

  return (
    <div className="mb-2.5">
      <div className="mb-4 inline-flex items-center gap-2">
        <div className="inline-flex items-center gap-2">
          <div className="flex flex-col">
            <p className={clsx('mb-2 mt-2.5 text-xl font-semibold text-gray-700')}>
              Based on Your Interests
            </p>
            <p className={clsx('text-nowrap text-xs font-normal text-gray-400')}>
              {isLoading ? '...' : `${communityList.length} communities`}
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-6 2xl:grid-cols-6"
      >
        {communityList.map((community: Community) => (
          <motion.div
            key={community.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer"
          >
            <Link href={`/communities/${community.id}`} target="_blank">
              <SingleCommunity community={community} />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
