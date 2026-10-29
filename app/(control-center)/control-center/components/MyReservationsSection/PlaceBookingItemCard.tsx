'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { cn } from '@/lib/utils';

import { DateBadge } from '../DateBadge';
import { DashboardPlaceBookingItem } from '../../hooks/useDashboardReservations';

const ACTION_CLASS: Record<'default' | 'lime' | 'danger', string> = {
  default: 'px-0 text-brand hover:brightness-95',
  lime: 'bg-lime px-3.5 text-brand-ink hover:bg-lime-dark',
  danger: 'px-0 text-danger hover:brightness-95',
};

/**
 * A booking the person made at a place - the third My reservations item type.
 * Nothing feeds this yet (see useDashboardReservations), but the row itself
 * is real, built against the handoff's exact status-pill and action spec.
 */
export const PlaceBookingItemCard = ({
  item,
  onOpen,
  onAction,
}: {
  item: DashboardPlaceBookingItem;
  onOpen: () => void;
  onAction: (actionKey: string) => void;
}) => {
  const title = `${item.isRestaurant ? 'Table for' : 'Visit for'} ${item.party}`;

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
            {title}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-[14.5px] text-ink-muted">
            <IconComponent
              iconName="Clock01Icon"
              size={17}
              color="currentColor"
              className="flex-shrink-0"
            />
            <span className="truncate">
              {moment(item.date).format('dddd')}, {item.time}, {item.party}{' '}
              {item.party === 1 ? 'guest' : 'guests'}
            </span>
          </span>
        </span>

        <DateBadge date={item.date} />
      </button>

      <div className="ml-[88px] mr-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-surface-muted py-1.5">
        <span
          className={cn(
            'inline-flex min-h-[28px] items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold',
            item.status.bg,
            item.status.fg,
          )}
        >
          <IconComponent iconName={item.status.icon} size={15} color="currentColor" />
          {item.status.label}
        </span>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {item.status.actions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={() => onAction(action.key)}
              className={cn(
                'inline-flex h-11 items-center gap-1.5 rounded-full text-sm font-semibold active:scale-[.98]',
                ACTION_CLASS[action.tone],
              )}
            >
              <IconComponent iconName={action.icon} size={16} color="currentColor" />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
