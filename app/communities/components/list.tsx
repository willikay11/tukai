'use client';

import { useSession } from 'next-auth/react';

import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { Interest } from '@/types/interest';

import InterestBasedCommunities from './interestBasedCommunities';
import PopularCommunities from './popularCommunities';
import RecommendedCommunities from './recommendedCommunities';

const colors = [
  { bg: 'bg-red-100', color: 'bg-red-500' },
  { bg: 'bg-blue-100', color: 'bg-blue-500' },
  { bg: 'bg-green-100', color: 'bg-green-500' },
  { bg: 'bg-yellow-100', color: 'bg-yellow-500' },
  { bg: 'bg-purple-100', color: 'bg-purple-500' },
];

export default function List() {
  const { data: session } = useSession();
  const { selectedCategoryId } = useSelectedCategory();

  if (selectedCategoryId === 'my-communities') {
    return (
      <div key={selectedCategoryId}>
        <p className="mb-4 mt-2.5 text-xl font-semibold text-gray-700">Following</p>
        {session?.user?.interests?.map((interest: Interest) => (
          <InterestBasedCommunities
            key={interest.id}
            interest={interest}
            color={colors[Math.floor(Math.random() * colors.length)]}
          />
        ))}
      </div>
    );
  }

  if (selectedCategoryId === 'recommended') {
    return (
      <div key={selectedCategoryId}>
        <PopularCommunities />
        <RecommendedCommunities />
      </div>
    );
  }
}
