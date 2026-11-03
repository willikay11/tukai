/* eslint-disable @next/next/no-img-element */
import { IconComponent } from '@/app/shared/components/Icons';
import type { TukaiItem } from '@/types/tukai';
import { itemKindLabel } from '@/utils/tukai';

/**
 * What kind of thing a card is: the green map pill for a place, the calendar
 * pill for an experience, people for a community, a route for an itinerary.
 */
export const TukaiKindIcon = ({ item }: { item: TukaiItem }) => {
  const label = item.kind === 'place' ? 'Place' : itemKindLabel(item);
  const src =
    item.kind === 'place'
      ? '/images/icons/pill-maps-bulk-green.svg'
      : item.kind === 'experience' && !item.isItinerary
        ? '/images/icons/pill-calendar-bulk-green.svg'
        : null;

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className="flex h-[21px] w-5 flex-shrink-0 items-center justify-center text-brand"
    >
      {src ? (
        <img src={src} alt="" className="block h-[18px] w-[18px]" />
      ) : (
        <IconComponent
          iconName={item.kind === 'community' ? 'UserMultipleIcon' : 'Route01Icon'}
          size={18}
          color="currentColor"
        />
      )}
    </span>
  );
};
