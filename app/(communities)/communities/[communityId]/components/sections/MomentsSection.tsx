'use client';

import { useRouter } from 'next/navigation';

import { MomentsMasonry } from '@/app/shared/components/Moments';
import { NoData } from '@/components/ui/noData';
import { Moment } from '@/types/moment';

import { SectionShell } from './SectionShell';

export const MomentsSection = ({
  communityName,
  moments,
  isLoading,
}: {
  communityName: string;
  moments: Moment[];
  isLoading: boolean;
}) => {
  const router = useRouter();

  return (
    <SectionShell id="moments" title={`Moments at ${communityName}`}>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : moments.length === 0 ? (
        <div className="py-10">
          <NoData message={`No moments from ${communityName} yet`} />
        </div>
      ) : (
        <MomentsMasonry
          moments={moments}
          selectedId={null}
          onSelect={(id) => router.push(`/moments?momentId=${id}`)}
          onLoadMore={() => {}}
          hasMore={false}
          isLoadingMore={false}
          columnsClassName="columns-2 gap-4 md:columns-3"
        />
      )}
    </SectionShell>
  );
};
