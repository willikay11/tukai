'use client';

import { useSession } from 'next-auth/react';

import { useSelectedCategory } from '@/context/SelectedCategoryContext';

import InterestBasedCommunities from './interestBasedCommunities';
import PopularCommunities from './popularCommunities';
import RecommendedCommunities from './recommendedCommunities';

export default function List() {
  const { data: session } = useSession();
  const { selectedCategoryId } = useSelectedCategory();

  if (selectedCategoryId === 'my-communities') {
    return (
      <div key={selectedCategoryId}>
        <p className="mb-4 mt-2.5 text-xl font-semibold text-gray-700">Following</p>
      </div>
    );
  }

  if (selectedCategoryId === 'recommended') {
    return (
      <div key={selectedCategoryId}>
        <PopularCommunities />

        <InterestBasedCommunities category={session?.user?.interests?.map((category) => category.id)} />
      </div>
    );
  }
}
