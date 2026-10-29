'use client';

import { useState } from 'react';

import { interestName } from '@/app/(profile)/profile/profile';
import { IconComponent } from '@/app/shared/components/Icons';

const COLLAPSED_COUNT = 4;

export const MyInterests = ({
  interests,
  onEdit,
}: {
  interests: { id: string; name?: string; title?: string }[];
  onEdit: () => void;
}) => {
  const [showAll, setShowAll] = useState(false);

  if (interests.length === 0) return null;

  const hasMore = interests.length > COLLAPSED_COUNT;
  const shown = showAll ? interests : interests.slice(0, COLLAPSED_COUNT);
  const more = interests.length - COLLAPSED_COUNT;

  return (
    <div>
      <div className="-mt-3 flex items-center justify-between gap-3">
        <h2 className="text-17 font-bold tracking-[-0.2px] text-brand-ink">My interests</h2>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-11 items-center gap-1.5 px-1 text-[13.5px] font-semibold text-brand hover:underline"
        >
          <IconComponent iconName="Edit04Icon" size={16} color="currentColor" />
          Edit
        </button>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        {shown.map((interest) => (
          <span
            key={interest.id}
            className="inline-flex h-[38px] items-center rounded-full bg-surface px-[15px] text-sm text-gray-900"
          >
            {interestName(interest)}
          </span>
        ))}

        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll((value) => !value)}
            aria-label={showAll ? 'Show fewer interests' : `Show ${more} more interests`}
            className="-my-[3px] inline-flex h-11 items-center"
          >
            <span className="inline-flex h-[38px] items-center rounded-full bg-surface-brand px-[15px] text-sm font-semibold text-brand">
              {showAll ? 'Show fewer' : `+${more}`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
