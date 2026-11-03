/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';

import { BucketListPicker } from '@/app/shared/components/BucketList';
import { IconComponent } from '@/app/shared/components/Icons';
import type { TukaiItem } from '@/types/tukai';
import { itemKindLabel } from '@/utils/tukai';

import { TukaiKindIcon } from './TukaiKindIcon';

/**
 * One suggestion under a reply: number (when it is on the map), name, kind
 * and area, a sideways row of photos, the facts, and what to do next.
 * Hovering selects its pin on the map.
 *
 * ⚠️ Not built yet from the handoff: "Book a table" and the booking card
 * (section 5), and the "Booked · {n} tickets" state for experiences the
 * person holds tickets for. An experience's book button opens the
 * experience, since the drawer cannot yet open straight on its booking step.
 */
export const TukaiResultCard = ({
  item,
  number,
  onOpen,
  onHover,
}: {
  item: TukaiItem;
  number?: number;
  onOpen: () => void;
  onHover: () => void;
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const kind = itemKindLabel(item);
  const openLabel = `View ${(item.kind === 'place' ? 'place' : kind).toLowerCase()}`;
  const canBookExperience = item.kind === 'experience' && !item.isPast && !item.isMine;
  const bookLabel = item.isSoldOut ? 'Join the waiting list' : item.isFree ? 'RSVP' : 'Book now';

  return (
    <div data-ai-card={item.id} onMouseEnter={onHover} className="flex min-w-0 flex-col gap-3">
      <div className="flex items-start gap-2.5">
        {number ? (
          <span
            aria-hidden="true"
            className="mt-4 flex h-[26px] min-w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-brand-ink px-[7px] text-[12.5px] font-bold text-white"
          >
            {number}
          </span>
        ) : null}
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${item.title}`}
          className="flex min-w-0 flex-1 flex-col gap-0.5 p-0 text-left"
        >
          <span className="flex min-w-0 items-start gap-[7px]">
            <TukaiKindIcon item={item} />
            <span className="min-w-0 text-pretty text-base font-bold leading-[1.3] text-gray-800">
              {item.title}
            </span>
          </span>
          <span className="text-[13.5px] leading-[1.4] text-ink-muted">{item.sub}</span>
        </button>
        {item.kind !== 'community' && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPickerOpen(true);
            }}
            aria-label={`Save ${item.title} to a bucket list`}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-surface-pill text-brand hover:bg-surface-brand"
          >
            <IconComponent iconName="ShoppingBasketAdd02Icon" size={19} color="currentColor" />
          </button>
        )}
      </div>

      {item.photos.length > 0 && (
        <div
          role="group"
          aria-label={`${item.title} photos`}
          className="-mr-5 flex snap-x snap-proximity gap-2 overflow-x-auto pr-5 scrollbar-hide"
        >
          {item.photos.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              loading="lazy"
              className="block aspect-square w-44 flex-shrink-0 snap-start rounded-xl bg-surface-brand object-cover"
            />
          ))}
        </div>
      )}

      {(item.detail || item.about) && (
        <div className="flex min-w-0 flex-col gap-1.5">
          {item.detail && (
            <span className="text-[13.5px] font-semibold leading-[1.4] text-ink-note">
              {item.detail}
            </span>
          )}
          {item.about && (
            <p className="m-0 line-clamp-2 text-pretty text-sm leading-normal text-gray-800">
              {item.about}
            </p>
          )}
        </div>
      )}

      <div className="-ml-2.5 -mt-1.5 flex flex-wrap items-center gap-2">
        {canBookExperience && (
          <button
            type="button"
            onClick={onOpen}
            aria-label={`${bookLabel}, ${item.title}`}
            className="ml-2.5 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-b from-brand-mid to-brand-deep pl-4 pr-5 text-[14.5px] font-semibold text-white hover:brightness-[1.06] active:scale-[.98]"
          >
            <IconComponent iconName="Ticket01Icon" size={18} color="currentColor" />
            {bookLabel}
          </button>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-sm font-semibold text-brand hover:bg-surface"
        >
          {openLabel}
          <IconComponent iconName="ArrowRight01Icon" size={17} color="currentColor" />
        </button>
      </div>

      {item.kind !== 'community' && (
        <BucketListPicker
          isOpen={isPickerOpen}
          setIsOpen={setIsPickerOpen}
          experienceId={item.kind === 'experience' ? item.id : undefined}
          placeId={item.kind === 'place' ? item.id : undefined}
          itemName={item.title}
        />
      )}
    </div>
  );
};
