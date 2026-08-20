import { cn } from '@/lib/utils';

export const RowSkeleton = ({
  cardClassName = 'aspect-[4/3] w-[280px]',
  hideText = false,
}: {
  cardClassName?: string;
  hideText?: boolean;
}) => (
  <div className="flex gap-4 overflow-hidden">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex-shrink-0">
        <div className={cn('animate-pulse rounded-xl bg-gray-200', cardClassName)} />
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
