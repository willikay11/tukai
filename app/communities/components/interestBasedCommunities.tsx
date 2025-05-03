'use client';

import IconComponent from '@/app/components/iconComponent';
import { useGetCommunities } from '@/hooks/communities';
import { Community } from '@/types/community';
import { Interest } from '@/types/interest';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import SingleCommunity from './community';
import { Status } from '@/enums/status';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const placeholders: Community[] = Array.from({ length: 12 }, (_, index) => ({
  id: `placeholder-${index}`,
  title: 'Loading...',
  description: '',
  categories: [],
  dateCreated: '',
  isBookmarked: false,
  isPublic: false,
  status: 'DRAFT' as Status,
  photos: [],
  location: {
    id: '',
    name: '',
    pointLat: 0,
    pointLong: 0,
    point: { type: 'Point', coordinates: [0, 0] },
    formattedAddress: '',
    street: '',
    city: '',
    state: '',
    country: '',
  },
  members: [],
  dateModified: '',
}));

export default function InterestBasedCommunities({
  interest,
  color,
}: {
  interest: Interest;
  color: { bg: string; color: string };
}) {
  const [communityList, setCommunityList] = useState<Community[]>(placeholders);

  const {
    data: communities,
    isLoading,
    error,
  } = useGetCommunities({ page: 1, enabled: true, category: interest.id });

  useEffect(() => {
    if (communities?.data.results) {
      setCommunityList(communities.data.results);
    }
  }, [communities]);

  if (!isLoading && communities?.data.results.length === 0) {
    return null;
  }

  return (
    <div className="mb-2.5">
      <div className="mb-4 inline-flex items-center gap-2">
        <div className="inline-flex items-center gap-2">
          {interest.icon && (
            <div className={`rounded-full ${color.bg} p-2`}>
              <IconComponent iconName={interest.icon} size={18} color={color.color} />
            </div>
          )}
          <div className="flex flex-col">
            <p className={clsx('text-nowrap text-sm font-bold text-gray-700')}>{interest.name}</p>
            <p className={clsx('text-nowrap text-xs font-normal text-gray-400')}>
              {communities?.data.results.length} communities
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6"
      >
        {communityList.map((community: Community) => (
          <Link href={`/communities/${community.id}`} target="_blank">
            <SingleCommunity key={community.id} community={community} />
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
