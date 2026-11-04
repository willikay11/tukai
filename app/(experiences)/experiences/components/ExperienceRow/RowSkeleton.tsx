import { RAIL_CARD_RESPONSIVE_WIDTH } from '@/app/shared/components/Lists/railCardWidth';
import { cn } from '@/lib/utils';

export const RowSkeleton = ({
  cardClassName = 'aspect-square w-[184px]',
  hideText = false,
}: {
  cardClassName?: string;
  hideText?: boolean;
}) => (
  <div className="flex gap-4 overflow-hidden">
    {Array.from({ length: 5 }).map((_, index) => (
      // Inside a rail it takes the rail's measured card width, like the cards
      // it stands in for
      <div key={index} className={cn('flex-shrink-0', RAIL_CARD_RESPONSIVE_WIDTH)}>
        <div className={cn('animate-pulse rounded-xl bg-gray-200', cardClassName, 'w-full')} />
        {!hideText && (
          <>
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
          </>
        )}
      </div>
    ))}
  </div>
);
