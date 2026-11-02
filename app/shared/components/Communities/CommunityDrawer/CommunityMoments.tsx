'use client';

import { useState } from 'react';

import { MomentsMosaicGrid } from '@/app/shared/components/Communities/MomentsMosaicGrid';
import { MomentComposerTrigger, MomentDrawer } from '@/app/shared/components/Moments';
import { Moment } from '@/types/moment';

import { COMMUNITY_SECTIONS } from './tabs';

/**
 * The handoff's Moments block: a composer row gated on membership (joining is
 * what unlocks it) and the fixed-span mosaic. `onShare` swaps the drawer's own
 * body over to the composer form, mirroring `PlaceDrawer`'s "moment" view.
 */
export const CommunityMoments = ({
  communityTitle,
  moments,
  isLoading,
  canPost,
  onShare,
  onBlockedShare,
}: {
  communityTitle: string;
  moments: Moment[];
  isLoading: boolean;
  /** A member or the owner - everyone else sees the same row, but it toasts instead. */
  canPost: boolean;
  onShare: () => void;
  onBlockedShare: () => void;
}) => {
  const [openMoment, setOpenMoment] = useState<Moment | null>(null);

  return (
    <section id={COMMUNITY_SECTIONS.moments} className="scroll-mt-[148px] space-y-3.5">
      <h3 className="text-19 font-bold tracking-[-0.2px] text-gray-800">
        Moments from {communityTitle}
      </h3>

      <MomentComposerTrigger
        placeholder={`Share a moment from ${communityTitle}`}
        onOpen={canPost ? onShare : onBlockedShare}
      />

      {isLoading ? (
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-[170px] animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : moments.length === 0 ? (
        <p className="text-sm leading-relaxed text-ink-muted">
          No moments from {communityTitle} yet. Yours could be the first.
        </p>
      ) : (
        <MomentsMosaicGrid
          moments={moments}
          onSelect={(id) => setOpenMoment(moments.find((moment) => moment.id === id) ?? null)}
        />
      )}

      <MomentDrawer moment={openMoment} onClose={() => setOpenMoment(null)} />
    </section>
  );
};
