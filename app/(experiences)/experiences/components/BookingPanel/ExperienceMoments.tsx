'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import {
  MomentComposer,
  MomentComposerTrigger,
  MomentsMasonry,
} from '@/app/shared/components/Moments';
import { useMoments } from '@/app/shared/hooks/useMoments';
import { NoData } from '@/components/ui/noData';
import { Moment } from '@/types/moment';

/**
 * What people posted at this experience, in the booking panel's second tab.
 *
 * The panel is a five-of-twelve column, so the masonry runs two columns at
 * every width rather than widening to three the way the full feed does.
 */
export const ExperienceMoments = ({
  experienceId,
  experienceTitle,
  place,
  community,
}: {
  experienceId: string;
  experienceTitle: string;
  // The experience's own place and community — a moment posted here surfaces
  // in their feeds too, which the composer says out loud
  place?: { id: string; title: string } | null;
  community?: { id: string; title: string } | null;
}) => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const { data, isLoading } = useMoments({ experience: experienceId, page_size: 12 });
  const moments: Moment[] = data?.data?.results ?? [];

  // Posting needs an account — the moments endpoints are all authenticated
  const canPost = sessionStatus === 'authenticated';

  // The same pill field the moments feed comments with, rather than a button
  const shareButton = canPost ? (
    <MomentComposerTrigger onOpen={() => setIsComposerOpen(true)} />
  ) : null;

  const composer = (
    <MomentComposer
      open={isComposerOpen}
      onOpenChange={setIsComposerOpen}
      contextLabel={experienceTitle}
      experienceId={experienceId}
      placeId={place?.id}
      placeLabel={place?.title}
      communityId={community?.id}
      communityLabel={community?.title}
    />
  );

  if (isLoading) {
    return (
      <div role="status" aria-label="Loading moments" className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (moments.length === 0) {
    return (
      <div className="space-y-4">
        {shareButton}
        <div className="py-6">
          <NoData message="No moments from this experience yet" />
        </div>
        {composer}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {shareButton}
      <MomentsMasonry
        moments={moments}
        selectedId={null}
        // The moments feed owns the viewer; this tab is a way in, not a copy of it
        onSelect={(id) => router.push(`/moments?momentId=${id}`)}
        onLoadMore={() => {}}
        hasMore={false}
        isLoadingMore={false}
        columnsClassName="columns-2 gap-3"
      />
      {composer}
    </div>
  );
};
