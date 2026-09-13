'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { MomentComposer } from '@/app/shared/components/Moments/MomentComposer';
import { MomentComposerTrigger } from '@/app/shared/components/Moments/MomentComposerTrigger';
import { MomentsMasonry } from '@/app/shared/components/Moments/MomentsMasonry';
import { useMoments } from '@/app/shared/hooks/useMoments';
import { NoData } from '@/components/ui/noData';
import { Moment } from '@/types/moment';

/**
 * What people posted at one experience, place or community, with the composer
 * above it.
 *
 * It lives in a narrow column — the booking panel, or a bottom sheet on a
 * phone — so the masonry runs two columns at every width rather than widening
 * to three the way the full feed does.
 */
export const ContextMoments = ({
  contextLabel,
  emptyMessage,
  experienceId,
  placeId,
  placeLabel,
  communityId,
  communityLabel,
}: {
  // What the moments belong to, named in the composer
  contextLabel: string;
  emptyMessage: string;
  experienceId?: string;
  placeId?: string;
  // Where else a moment posted here will surface. An experience carries its
  // own place and community; a place page passes only itself.
  placeLabel?: string;
  communityId?: string;
  communityLabel?: string;
}) => {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const { data, isLoading } = useMoments({
    experience: experienceId,
    place: experienceId ? undefined : placeId,
    page_size: 12,
  });
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
      contextLabel={contextLabel}
      experienceId={experienceId}
      placeId={placeId}
      placeLabel={placeLabel}
      communityId={communityId}
      communityLabel={communityLabel}
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
          <NoData message={emptyMessage} />
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
        // The moments feed owns the viewer; this is a way in, not a copy of it
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
