'use client';

import { useState } from 'react';

import moment from 'moment';

import { CalendarItem } from '@/app/(profile)/hooks';
import { WrittenReview } from '@/app/(profile)/hooks/useMyReviews';
import { LeaveReviewDrawer } from '@/app/shared/components/Experiences';
import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { MomentComposer } from '@/app/shared/components/Moments';
import { cn } from '@/lib/utils';

export interface CalendarDayVm {
  offset: number;
  date: string;
  count: number;
  isToday: boolean;
  isPast: boolean;
}

const TAG_STYLE: Record<CalendarItem['tag'], string> = {
  Booked: 'bg-surface-brand text-brand-deep',
  Hosting: 'bg-lime text-brand-ink',
  Attended: 'bg-surface-muted text-ink-muted',
};

const DayButton = ({
  day,
  isSelected,
  onClick,
}: {
  day: CalendarDayVm;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const date = moment(day.date);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={`${date.format('ddd D MMM')}, ${day.count} ${day.count === 1 ? 'plan' : 'plans'}`}
      className="flex h-11 flex-shrink-0 items-center"
    >
      <span
        className={cn(
          'inline-flex h-9 items-center gap-[5px] whitespace-nowrap rounded-full border px-3.5 text-sm',
          isSelected && !day.isPast && 'border-surface-pill-active bg-surface-pill-active',
          isSelected && day.isPast && 'border-line bg-line',
          !isSelected && 'border-line bg-white',
        )}
      >
        <span
          className={cn(
            isSelected ? (day.isPast ? 'text-ink' : 'text-brand-deep') : 'text-ink-muted',
          )}
        >
          {date.format('ddd')}
        </span>
        <span
          className={cn(
            'font-bold',
            day.isPast
              ? isSelected
                ? 'text-gray-900'
                : 'text-ink-subtle'
              : isSelected
                ? 'text-brand-deep'
                : day.isToday
                  ? 'text-brand'
                  : 'text-gray-900',
          )}
        >
          {date.format('D')}
        </span>
        <span className={isSelected ? (day.isPast ? 'text-ink' : 'text-brand-deep') : 'text-ink-muted'}>
          {date.format('MMM')}
        </span>

        {day.count > 0 && (
          <span aria-hidden="true" className="ml-0.5 flex items-center gap-[3px]">
            {Array.from({ length: Math.min(day.count, 3) }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  'h-[5px] w-[5px] flex-shrink-0 rounded-full',
                  day.isPast ? 'bg-ink-subtle' : day.isToday ? 'bg-brand' : 'bg-brand-deep',
                )}
              />
            ))}
          </span>
        )}
      </span>
    </button>
  );
};

const CalendarItemRow = ({
  item,
  review,
  onOpen,
  onShare,
  onReview,
}: {
  item: CalendarItem;
  review?: WrittenReview;
  onOpen: () => void;
  onShare: () => void;
  onReview: () => void;
}) => (
  <div className="flex flex-col gap-1 rounded-xl bg-white p-2 shadow-sm">
    <button
      type="button"
      onClick={onOpen}
      className="flex min-w-0 items-center gap-3 rounded-[10px] text-left"
    >
      <div className="relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-[10px] bg-surface-brand">
        <PhotoImage src={item.image} alt="" fill sizes="72px" className="object-cover" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-[14.5px] font-semibold leading-[1.3] text-gray-900">
            {item.title}
          </span>
          <span
            className={cn(
              'flex-shrink-0 rounded-full px-2 py-0.5 text-[11.5px] font-semibold',
              TAG_STYLE[item.tag],
            )}
          >
            {item.tag}
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-13 text-ink-muted">
          <IconComponent iconName="Calendar03Icon" size={15} color="currentColor" />
          {moment(item.date).format('ddd D MMM, h:mm A')}
        </span>
        {item.place && (
          <span className="flex min-w-0 items-center gap-1.5 text-13 text-ink-muted">
            <IconComponent iconName="Location01Icon" size={15} color="currentColor" />
            <span className="truncate">{item.place}</span>
          </span>
        )}
      </div>
    </button>

    {item.isPast && item.tag === 'Attended' && (
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 pl-[84px]">
        <button
          type="button"
          onClick={onShare}
          className="inline-flex h-11 items-center"
        >
          <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface pl-2.5 pr-3 text-13 font-semibold text-gray-900">
            <IconComponent iconName="Camera01Icon" size={15} color="currentColor" />
            Share a moment
          </span>
        </button>

        {review ? (
          <span className="inline-flex items-center gap-1 text-13 font-semibold text-gray-900">
            <IconComponent iconName="StarIcon" variant="bulk" size={15} color="currentColor" className="text-brand" />
            You rated {review.rating.rating}
          </span>
        ) : (
          <button type="button" onClick={onReview} className="inline-flex h-11 items-center">
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface-brand pl-2.5 pr-3 text-13 font-semibold text-brand-deep">
              <IconComponent iconName="StarIcon" size={15} color="currentColor" />
              Leave a review
            </span>
          </button>
        )}
      </div>
    )}
  </div>
);

export const MyCalendar = ({
  days,
  offset,
  onSelectOffset,
  items,
  label,
  emptyLine,
  showToday,
  onToday,
  atStart,
  atEnd,
  onPrev,
  onNext,
  writtenByExperienceId,
  onOpenExperience,
  onFindExperiences,
}: {
  days: CalendarDayVm[];
  offset: number;
  onSelectOffset: (offset: number) => void;
  items: CalendarItem[];
  label: string;
  emptyLine: string;
  showToday: boolean;
  onToday: () => void;
  atStart: boolean;
  atEnd: boolean;
  onPrev: () => void;
  onNext: () => void;
  writtenByExperienceId: Map<string, WrittenReview>;
  onOpenExperience: (experienceId: string) => void;
  onFindExperiences: () => void;
}) => {
  const [moments, setMoments] = useState<{ experienceId: string; title: string } | null>(null);
  const [review, setReview] = useState<{ experienceId: string; title: string } | null>(null);

  return (
    <div>
      <h2 className="text-17 font-bold tracking-[-0.2px] text-brand-ink">My calendar</h2>
      <p className="mt-0.5 text-[13.5px] text-ink-muted">Your upcoming experiences and bookings</p>

      <div className="mt-3 flex flex-col gap-1.5 rounded-18 bg-surface p-1.5">
        <div className="flex items-center gap-0.5 px-0.5 pt-0.5">
          <button
            type="button"
            onClick={onPrev}
            disabled={atStart}
            aria-label="Previous date with plans"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-gray-900 transition-colors enabled:hover:bg-surface-brand-hover disabled:opacity-35"
          >
            <IconComponent iconName="ArrowLeft01Icon" size={18} color="currentColor" />
          </button>
          <span className="whitespace-nowrap text-[15px] font-semibold text-brand-ink">{label}</span>
          <button
            type="button"
            onClick={onNext}
            disabled={atEnd}
            aria-label="Next date with plans"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-gray-900 transition-colors enabled:hover:bg-surface-brand-hover disabled:opacity-35"
          >
            <IconComponent iconName="ArrowRight01Icon" size={18} color="currentColor" />
          </button>

          {showToday && (
            <button
              type="button"
              onClick={onToday}
              className="ml-auto h-11 whitespace-nowrap rounded-full px-3.5 text-[13.5px] font-semibold text-brand transition-colors hover:bg-surface-brand-hover"
            >
              Next up
            </button>
          )}
        </div>

        <div className="scrollbar-hide flex gap-1.5 overflow-x-auto px-1.5 pb-1">
          {days.map((day) => (
            <DayButton
              key={day.offset}
              day={day}
              isSelected={day.offset === offset}
              onClick={() => onSelectOffset(day.offset)}
            />
          ))}
        </div>

        {items.length > 0 ? (
          items.map((item) => (
            <CalendarItemRow
              key={item.key}
              item={item}
              review={writtenByExperienceId.get(item.experienceId)}
              onOpen={() => onOpenExperience(item.experienceId)}
              onShare={() => setMoments({ experienceId: item.experienceId, title: item.title })}
              onReview={() => setReview({ experienceId: item.experienceId, title: item.title })}
            />
          ))
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-white p-4 shadow-sm">
            <span className="text-sm text-ink-muted">{emptyLine}</span>
            <button
              type="button"
              onClick={onFindExperiences}
              className="h-11 whitespace-nowrap rounded-full border border-line px-[18px] text-sm font-semibold text-brand-ink"
            >
              Find experiences
            </button>
          </div>
        )}
      </div>

      <MomentComposer
        open={Boolean(moments)}
        onOpenChange={(open) => !open && setMoments(null)}
        experienceId={moments?.experienceId}
        contextLabel={moments?.title}
      />

      {review && (
        <LeaveReviewDrawer
          experienceId={review.experienceId}
          experienceTitle={review.title}
          isOpen={Boolean(review)}
          onClose={() => setReview(null)}
        />
      )}
    </div>
  );
};
