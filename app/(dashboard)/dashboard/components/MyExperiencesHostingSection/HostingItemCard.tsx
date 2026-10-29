import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';

import { DateBadge } from '../DateBadge';
import { DashboardHostingItem } from '../../hooks/useDashboardHosting';

export const HostingItemCard = ({ item }: { item: DashboardHostingItem }) => (
  <div className="flex min-w-0 flex-col gap-2">
    <div className="flex min-w-0 flex-col rounded-xl bg-white shadow-[0_1px_3px_rgba(1,51,52,.07)]">
      <button
        type="button"
        onClick={item.onOpen}
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
            <span className="truncate">{item.when}</span>
          </span>
        </span>

        {item.badge && <DateBadge date={item.badge} />}
      </button>
    </div>

    <div className="flex flex-wrap gap-2">
      {item.stats.map((stat) => (
        <button
          key={stat.label}
          type="button"
          onClick={stat.onClick}
          className="inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-[18px] text-[14.5px] text-ink-muted shadow-[0_1px_3px_rgba(1,51,52,.07)] hover:text-brand-ink"
        >
          {stat.label}
          <span className="font-bold text-gray-900">{stat.value}</span>
        </button>
      ))}
    </div>
  </div>
);
