'use client';

import { useSession } from 'next-auth/react';

import { useSelectedCategory } from '@/context/SelectedCategoryContext';

import InterestBasedCommunities from './interestBasedCommunities';
import Communities from './Communities';
import RecommendedCommunities from './recommendedCommunities';

export default function List() {
  const { data: session } = useSession();
  const { selectedCategoryId } = useSelectedCategory();

  if (selectedCategoryId === 'my-communities') {
    return (
      <div key={selectedCategoryId}>
        <p className="mb-4 mt-2.5 text-xl font-semibold text-gray-700">Following</p>
        <Communities following aspectRatio="aspect-square" noDataText="You don't have any communities yet. When you create or follow communities, they will appear here." />
      </div>
    );
  }

  if (selectedCategoryId === 'recommended') {
    return (
      <div key={selectedCategoryId}>
        <div className='mb-4'>
          <p className="mb-4 mt-2.5 text-xl font-semibold text-gray-700">Popular Communities</p>
          <Communities popularCommunities aspectRatio="aspect-square h-full md:h-[150px] md:aspect-3/2" />
        </div>

        <InterestBasedCommunities category={session?.user?.interests?.map((category) => category.id)} />
      </div>
    );
  }
}
