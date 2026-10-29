'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { cn } from '@/lib/utils';

import { StripDay, isCurrentWeek, isLastWeek, weekLabel } from './week-strip';

const PagerArrow = ({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: 'back' | 'next';
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-brand-ink transition-colors hover:bg-surface disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
  >
    <IconComponent
      iconName={direction === 'back' ? 'ArrowLeft01Icon' : 'ArrowRight01Icon'}
      size={20}
      color="currentColor"
    />
  </button>
);

const DayPill = ({
  day,
  dots,
  dotClassName,
  isHeld,
  isSelected,
  onSelect,
}: {
  day: StripDay;
  dots: number;
  dotClassName?: string;
  isHeld?: boolean;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    disabled={day.isPast}
    aria-pressed={isSelected}
    className={cn(
      'inline-flex h-11 flex-shrink-0 items-center gap-[5px] rounded-full border px-3.5 text-[14.5px] transition-colors',
      day.isPast
        ? 'cursor-default border-transparent bg-surface text-ink-subtle'
        : isSelected
          ? 'border-transparent bg-green-200 text-brand'
          : 'border-line bg-white text-brand-ink hover:bg-surface',
      isSelected && 'font-semibold',
    )}
  >
    <span>{day.weekday}</span>
    <span className="font-bold">{day.dayOfMonth}</span>
    {dots > 0 && !day.isPast && (
      <span aria-hidden className="ml-0.5 flex items-center gap-[3px]">
        {Array.from({ length: dots }, (_, index) => (
          <span
            key={index}
            className={cn(
              'h-[5px] w-[5px] rounded-full',
              dotClassName ?? (isSelected ? 'bg-brand' : 'bg-lime-dark'),
            )}
          />
        ))}
      </span>
    )}
    {isHeld && (
      <IconComponent
        iconName="StopCircleIcon"
        size={15}
        color="currentColor"
        className="flex-shrink-0 text-warn"
      />
    )}
  </button>
);

export const WeekStrip = ({
  anchor,
  week,
  selectedKey,
  dotsFor,
  dotClassNameFor,
  isHeldFor,
  navClassName = '-ml-3',
  onSelect,
  onMove,
}: {
  navClassName?: string;
  anchor: Date;
  week: StripDay[];
  selectedKey: string;
  dotsFor: (day: StripDay) => number;
  dotClassNameFor?: (day: StripDay) => string | undefined;
  isHeldFor?: (day: StripDay) => boolean;
  onSelect: (key: string) => void;
  onMove: (weeks: number) => void;
}) => (
  <>
    <div className={cn('flex items-center gap-0.5', navClassName)}>
      <PagerArrow
        direction="back"
        label="Previous week"
        disabled={isCurrentWeek(anchor)}
        onClick={() => onMove(-1)}
      />
      <span aria-live="polite" className="text-[15.5px] font-semibold text-brand-ink">
        {weekLabel(week)}
      </span>
      <PagerArrow
        direction="next"
        label="Next week"
        disabled={isLastWeek(anchor)}
        onClick={() => onMove(1)}
      />
    </div>

    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {week.map((day) => (
        <DayPill
          key={day.key}
          day={day}
          dots={dotsFor(day)}
          dotClassName={dotClassNameFor?.(day)}
          isHeld={isHeldFor?.(day)}
          isSelected={day.key === selectedKey}
          onSelect={() => onSelect(day.key)}
        />
      ))}
    </div>
  </>
);
