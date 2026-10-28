'use client';

import { useState } from 'react';

import { useMyMoments } from '@/app/(profile)/hooks/useMyMoments';
import { MomentCard, MomentComposer, MomentDrawer } from '@/app/shared/components/Moments';
import { IconComponent } from '@/app/shared/components/Icons';
import { Moment } from '@/types/moment';

export const MomentsTab = ({ userId }: { userId?: string | null }) => {
  const { isLoading, moments } = useMyMoments(userId);
  const [openMoment, setOpenMoment] = useState<Moment | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-19 font-bold tracking-[-0.3px] text-brand-ink">Your moments</h2>
          <p className="mt-1 text-[13.5px] text-ink-muted">
            Each one is attached to a community, place or experience you were part of.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsComposerOpen(true)}
          className="inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-lime px-4 pl-[13px] text-[14.5px] font-semibold text-brand-ink hover:bg-lime-dark"
        >
          <IconComponent iconName="Camera01Icon" size={18} color="currentColor" />
          Share a moment
        </button>
      </div>

      {isLoading ? (
        <div className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(max(160px,(100%_-_40px)/3),1fr))] gap-x-5 gap-y-7">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : moments.length > 0 ? (
        <div className="mt-3.5 grid grid-cols-[repeat(auto-fill,minmax(max(160px,(100%_-_40px)/3),1fr))] gap-x-5 gap-y-7">
          {moments.map((moment) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              onClick={() => setOpenMoment(moment)}
              className="w-full"
              showAuthor={false}
            />
          ))}
        </div>
      ) : (
        <div className="mt-3.5 rounded-xl bg-surface px-5 py-[18px]">
          <span className="text-sm text-ink-muted">
            No moments yet. Post one from any experience, place or community page.
          </span>
        </div>
      )}

      <MomentComposer open={isComposerOpen} onOpenChange={setIsComposerOpen} />
      <MomentDrawer moment={openMoment} onClose={() => setOpenMoment(null)} />
    </div>
  );
};
