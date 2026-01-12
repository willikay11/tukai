'use client';

import Link from 'next/link';

import { motion } from 'framer-motion';

import { useGetCommunities } from '@/hooks/communities';
import { Community } from '@/types/community';

import SingleCommunity from './community';

export default function PopularCommunities() {
  const {
    data: communities,
    isLoading,
    error,
  } = useGetCommunities({ page: 1, enabled: true, popularCommunities: true });

  if (communities?.data?.results?.length === 0) {
    return null;
  }

  return (
    <>
      <p className="mb-4 mt-2.5 text-xl font-semibold text-gray-700">Popular Communities</p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6"
      >
        {communities?.data?.results?.map((community: Community) => (
          <Link href={`/communities/${community.id}`} target="_blank">
            <SingleCommunity key={community.id} community={community} />
          </Link>
        ))}
      </motion.div>
    </>
  );
}
