'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';
import { PlanStop, minutesOf, stopEnd, timeLabel } from '@/types/plan';

/** What a stop is, said in one word where it is not obvious. */
const KIND_BADGE: Record<PlanStop['kind'], { label: string; icon: string }> = {
  experience: { label: 'Experience', icon: 'Ticket01Icon' },
  place: { label: 'Place', icon: 'Location01Icon' },
  // The canvas's own words: a custom stop is not listed on Tukai at all
  custom: { label: 'Only you see this', icon: 'SquareLock02Icon' },
};

export const PlanStopRow = ({
  stop,
  index,
  total,
  warning,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onOpen,
}: {
  stop: PlanStop;
  index: number;
  total: number;
  warning: string | null;
  onChange: (changes: Partial<PlanStop>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onOpen?: () => void;
}) => {
  const start = minutesOf(stop.time);
  const end = stopEnd(stop);
  const badge = KIND_BADGE[stop.kind];

  return (
    <li className="flex flex-col gap-3 border-b border-gray-100 py-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
          <PhotoImage
            src={stop.photo ?? undefined}
            alt={stop.title}
            fill
            sizes="56px"
            className="object-cover"
            fallback={
              <span className="flex h-full w-full items-center justify-center text-ink-subtle">
                <IconComponent iconName={badge.icon} size={18} color="currentColor" />
              </span>
            }
          />
        </div>

        <div className="min-w-0 flex-1">
          {onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              className="max-w-full truncate text-left text-sm font-bold text-gray-900 hover:underline"
            >
              {stop.title}
            </button>
          ) : (
            <p className="truncate text-sm font-bold text-gray-900">{stop.title}</p>
          )}

          <p className="truncate text-13 text-ink-muted">{stop.subtitle ?? badge.label}</p>

          <p
            className={cn(
              'mt-0.5 text-13',
              start === null ? 'font-medium text-amber-700' : 'text-ink',
            )}
          >
            {start === null
              ? 'Add a time'
              : `${timeLabel(start)}${end === null ? '' : ` - ${timeLabel(end)}`}`}
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col items-center">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            aria-label={`Move ${stop.title} up`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface disabled:opacity-30"
          >
            <IconComponent iconName="ArrowUp01Icon" size={18} color="currentColor" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            aria-label={`Move ${stop.title} down`}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-surface disabled:opacity-30"
          >
            <IconComponent iconName="ArrowDown01Icon" size={18} color="currentColor" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-[68px]">
        <label className="sr-only" htmlFor={`time-${stop.id}`}>
          Time at {stop.title}
        </label>
        <input
          id={`time-${stop.id}`}
          type="time"
          value={stop.time ?? ''}
          onChange={(event) => onChange({ time: event.target.value })}
          className="h-10 rounded-full border border-line bg-white px-3 text-13 text-gray-900 outline-none focus:border-brand"
        />

        <label className="sr-only" htmlFor={`duration-${stop.id}`}>
          How long at {stop.title}
        </label>
        <select
          id={`duration-${stop.id}`}
          value={String(stop.durationMinutes ?? 60)}
          onChange={(event) => onChange({ durationMinutes: Number(event.target.value) })}
          className="h-10 rounded-full border border-line bg-white px-3 text-13 text-gray-900 outline-none focus:border-brand"
        >
          {[30, 60, 90, 120, 180, 240].map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${stop.title}`}
          className="ml-auto flex h-10 items-center gap-1.5 rounded-full px-3 text-13 font-medium text-danger transition-colors hover:bg-danger-surface"
        >
          <IconComponent iconName="Delete02Icon" size={16} color="currentColor" />
          Remove
        </button>
      </div>

      {warning && (
        <p className="flex items-start gap-2 rounded-10 bg-amber-50 px-3 py-2 text-13 leading-relaxed text-amber-800">
          <IconComponent
            iconName="Alert02Icon"
            size={16}
            color="currentColor"
            className="mt-0.5 flex-shrink-0"
          />
          {warning}
        </p>
      )}
    </li>
  );
};
