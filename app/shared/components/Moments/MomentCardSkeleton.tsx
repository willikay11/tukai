/**
 * The loading shape of MomentCard: the tall photo, the author row, then two
 * lines of caption. Sized to the card so the grid does not shift when the
 * moments arrive.
 */
export const MomentCardSkeleton = () => (
  <div aria-hidden="true" className="flex w-full flex-col">
    <div className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-gray-200" />

    <div className="mt-3 flex items-center gap-2.5">
      <div className="h-9 w-9 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
      <div className="flex flex-col gap-1.5">
        <div className="h-3.5 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
      </div>
    </div>

    <div className="mt-3 flex flex-col gap-2">
      <div className="h-3.5 w-full animate-pulse rounded bg-gray-200" />
      <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-200" />
    </div>
  </div>
);
