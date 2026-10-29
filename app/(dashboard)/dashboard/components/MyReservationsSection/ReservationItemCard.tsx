'use client';

import { useState } from 'react';

import moment from 'moment';

import { CalendarItem } from '@/app/(profile)/hooks/calendar-agenda';
import { WrittenReview } from '@/app/(profile)/hooks/useMyReviews';
import { LeaveReviewDrawer } from '@/app/shared/components/Experiences';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { MomentComposer } from '@/app/shared/components/Moments';

import { DateBadge } from '../DateBadge';

/**
 * A ticket booking or a past-attended experience, on the Dashboard's My
 * reservations section. The third item type the handoff describes, a place
 * booking, is its own card (see PlaceBookingItemCard) - there is no reservation
 * endpoint that spans every place at once yet, so it has nothing to render here.
 */
export const ReservationItemCard = ({
  item,
  review,
  onOpen,
}: {
  item: CalendarItem;
  review?: WrittenReview;
  onOpen: () => void;
}) => {
  const [isMomentOpen, setIsMomentOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const isAttended = item.isPast && item.tag === 'Attended';

  return (
    <div className="flex min-w-0 flex-col rounded-xl bg-white shadow-[0_1px_3px_rgba(1,51,52,.07)]">
      <button
        type="button"
        onClick={onOpen}
        className="flex min-h-[84px] w-full min-w-0 items-center gap-3.5 rounded-xl p-3 text-left hover:bg-[#FAFBFA]"
      >
        <span className="relative block h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
          <PhotoImage src={item.image} alt="" fill sizes="60px" className="object-cover" />
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="truncate text-base font-semibold leading-[1.3] text-gray-900">
            {item.title}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-[14.5px] text-ink-muted">
            <IconComponent
              iconName="Clock01Icon"
              size={17}
              color="currentColor"
              className="flex-shrink-0"
            />
            <span className="truncate">
              {moment(item.date).format('dddd')}, {moment(item.date).format('h:mm A')}
            </span>
          </span>
        </span>

        <DateBadge date={item.date} />
      </button>

      {isAttended && (
        <div className="ml-[88px] mr-3.5 flex flex-wrap items-center gap-x-5 border-t border-surface-muted py-1">
          <button
            type="button"
            onClick={() => setIsMomentOpen(true)}
            className="inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-brand"
          >
            <IconComponent iconName="Camera01Icon" size={16} color="currentColor" />
            Share a moment
          </button>

          {review ? (
            <span className="inline-flex items-center gap-[5px] text-sm text-ink-muted">
              <IconComponent
                iconName="StarIcon"
                variant="bulk"
                size={15}
                color="currentColor"
                className="text-brand"
              />
              You rated {review.rating.rating}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setIsReviewOpen(true)}
              className="inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-brand"
            >
              <IconComponent iconName="StarIcon" size={16} color="currentColor" />
              Leave a review
            </button>
          )}
        </div>
      )}

      <MomentComposer
        open={isMomentOpen}
        onOpenChange={setIsMomentOpen}
        experienceId={item.experienceId}
        contextLabel={item.title}
      />

      {isReviewOpen && (
        <LeaveReviewDrawer
          experienceId={item.experienceId}
          experienceTitle={item.title}
          experienceImage={item.image}
          organiser={item.organiser}
          attendedWhen={item.date}
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
        />
      )}
    </div>
  );
};
