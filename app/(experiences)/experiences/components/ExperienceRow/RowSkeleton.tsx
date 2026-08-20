export const RowSkeleton = ({
  cardWidth = 280,
  cardHeight,
}: {
  cardWidth?: number;
  cardHeight?: number;
}) => (
  <div className="flex gap-4 overflow-hidden">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex-shrink-0" style={{ width: cardWidth }}>
        <div
          className="w-full animate-pulse rounded-xl bg-gray-200"
          style={cardHeight ? { height: cardHeight } : { aspectRatio: '4 / 3' }}
        />
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="mt-1 h-3 w-1/2 animate-pulse rounded bg-gray-200" />
      </div>
    ))}
  </div>
);
