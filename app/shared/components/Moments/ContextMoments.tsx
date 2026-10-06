'use client';

import { useState } from 'react';

import { useSession } from 'next-auth/react';

import { IconComponent } from '@/app/shared/components/Icons';
import { MomentComposer } from '@/app/shared/components/Moments/MomentComposer';
import { MomentDrawer } from '@/app/shared/components/Moments/MomentDrawer';
import { MomentsMasonry } from '@/app/shared/components/Moments/MomentsMasonry';
import { useMoments } from '@/app/shared/hooks/useMoments';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { Moment } from '@/types/moment';

/**
 * What people posted at one experience, place or community, with the composer
 * above it.
 *
 * It lives in a narrow column - the booking panel, or a bottom sheet on a
 * phone - so the masonry runs two columns at every width rather than widening
 * to three the way the full feed does.
 */
export const ContextMoments = ({
  title,
  onShare,
  contextLabel,
  emptyMessage,
  experienceId,
  placeId,
  placeLabel,
  communityId,
  communityLabel,
}: {
  /** A heading over the section. Omitted where a tab already names it. */
  title?: string;
  /**
   * Given one, pressing Share moment calls this instead of opening the
   * composer dialog - for a surface that shows the form in place rather than
   * stacking a second panel over itself.
   */
  onShare?: () => void;
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
  const { status: sessionStatus } = useSession();
  const { setOpenSignIn } = useAuthDialog();
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [openMoment, setOpenMoment] = useState<Moment | null>(null);

  const { data, isLoading } = useMoments({
    experience: experienceId,
    place: experienceId ? undefined : placeId,
    page_size: 12,
  });
  const moments: Moment[] = data?.data?.results ?? [];

  // Posting needs an account - the moments endpoints are all authenticated.
  // The invitation still shows either way: hiding it from a signed-out reader
  // leaves the section looking like nothing can be done with it.
  const canPost = sessionStatus === 'authenticated';

  const shareButton = (
    <button
      type="button"
      onClick={() => {
        if (!canPost) {
          setOpenSignIn(true);
          return;
        }
        if (onShare) onShare();
        else setIsComposerOpen(true);
      }}
      className="inline-flex h-12 flex-shrink-0 items-center gap-2.5 rounded-full bg-lime px-6 text-[15px] font-bold text-brand-ink transition-colors hover:bg-lime-dark"
    >
      <IconComponent iconName="DashboardCircleAddIcon" size={20} color="currentColor" />
      Share moment
    </button>
  );

  const heading = title ? <h3 className="text-[22px] font-bold text-brand-ink">{title}</h3> : null;

  // The caller owns the form where it asked to, so there is no second one here
  const composer = onShare ? null : (
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
        {heading}
        {shareButton}
        {/* A line, not an illustrated empty card: the invitation above it is
            what the reader is meant to act on */}
        <p className="text-[15px] text-ink-muted">{emptyMessage}</p>
        {composer}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {heading}
      {shareButton}
      <MomentsMasonry
        moments={moments}
        onSelect={(id) => setOpenMoment(moments.find((moment) => moment.id === id) ?? null)}
        onLoadMore={() => {}}
        hasMore={false}
        isLoadingMore={false}
        columnsClassName="columns-2 gap-3"
      />
      <MomentDrawer moment={openMoment} onClose={() => setOpenMoment(null)} />
      {composer}
    </div>
  );
};
