'use client';

import { useSession } from 'next-auth/react';
import InterestBasedCommunities from './interestBasedCommunities';
import { Interest } from '@/types/interest';

type ListCommunitiesProps = {
  category?: string;
};

const colors = [
  { bg: 'bg-red-100', color: 'bg-red-500' },
  { bg: 'bg-blue-100', color: 'bg-blue-500' },
  { bg: 'bg-green-100', color: 'bg-green-500' },
  { bg: 'bg-yellow-100', color: 'bg-yellow-500' },
  { bg: 'bg-purple-100', color: 'bg-purple-500' },
];

export default function List({ category }: ListCommunitiesProps) {
  const { data: session } = useSession();

  return (
    <>
      <p className="mb-4 mt-2.5 text-xl font-semibold text-gray-700">Following</p>
      {session?.user?.interests?.map((interest: Interest) => (
        <InterestBasedCommunities
          key={interest.id}
          interest={interest}
          color={colors[Math.floor(Math.random() * colors.length)]}
        />
      ))}
    </>
  );
}
