import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { PhotoImage } from '@/app/shared/components/Images';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';

import { DashboardPlaceItem } from '../../hooks/useDashboardPlaces';

export const PlaceCard = ({ place }: { place: DashboardPlaceItem }) => {
  const drawer = usePlaceDrawer();

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    // A modifier asks the browser for something else - a new tab, a new
    // window - and the link should do that rather than the drawer
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    // nextjs-toploader's click listener is also on `document`, a sibling of
    // React's own delegated one rather than an ancestor - only
    // stopImmediatePropagation() on the native event stops it starting for a
    // click that opens the drawer rather than navigating
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    drawer?.openPlace(place.id);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-14 border-[0.5px] border-line-shell bg-shell p-1.5">
      <div className="flex min-w-0 flex-col rounded-xl bg-white shadow-[0_1px_3px_rgba(1,51,52,.07)]">
        <Link
          href={place.onOpenHref}
          onClick={drawer ? handleOpen : undefined}
          className="flex min-h-[84px] w-full min-w-0 items-center gap-3.5 rounded-xl p-3 hover:bg-[#FAFBFA]"
        >
          <span className="relative block h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-xl bg-surface-brand">
            <PhotoImage src={place.image} alt="" fill sizes="60px" className="object-cover" />
          </span>

          <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
            <span className="truncate text-base font-semibold leading-[1.3] text-gray-900">
              {place.name}
            </span>
            <span className="text-[14.5px] text-ink-muted">
              {place.locality || 'Location not set'}
            </span>
          </span>

          <IconComponent
            iconName="ArrowUpRight01Icon"
            size={20}
            color="currentColor"
            className="flex-shrink-0 text-brand"
          />
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {place.stats.map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={stat.onClick}
            className="inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-[18px] text-[14.5px] text-ink-muted shadow-[0_1px_3px_rgba(1,51,52,.07)] hover:text-brand-ink"
          >
            {stat.label}
            {stat.value && <span className="font-bold text-gray-900">{stat.value}</span>}
            {stat.alert && (
              <span
                role="img"
                aria-label="New"
                className="h-2 w-2 flex-shrink-0 rounded-full bg-danger"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
