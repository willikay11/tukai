'use client';
import { useMemo } from 'react';

import Link from 'next/link';

import { motion } from 'framer-motion';

import NoData from '@/components/ui/noData';
import { Status } from '@/enums/status';
import { useGetCommunities } from '@/hooks/communities';
import { Community } from '@/types/community';

import SingleCommunity from './community';

const ITEMS_PER_PAGE = 4;

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

export default function PopularCommunities() {
  const {
    data: communities,
    isLoading,
    error,
  } = useGetCommunities({ page: 1, enabled: true, popularCommunities: true });

  const communityList = useMemo(() => {
    if (isLoading) {
      return placeholders;
    }
    return communities?.data?.results || [];
  }, [communities, isLoading]);

  if (!isLoading && communityList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className='mb-4'
      >
        <NoData message="No communities found" />
      </motion.div>
    );
  }

  return (
    <div className='mb-4'>
      <p className="mb-4 mt-2.5 text-xl font-semibold text-gray-700">Popular Communities</p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6"
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
              <SingleCommunity community={community} aspectRatio="aspect-3/2" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
