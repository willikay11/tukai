/**
 * The loading shape of a NearbyPlaceCard in a break rail: a 72px photo beside
 * three lines of name, kind and distance, on the same white card.
 */
export const RailPlaceCardSkeleton = () => (
  <div
    aria-hidden="true"
    className="flex w-[280px] flex-shrink-0 items-center gap-3.5 rounded-xl bg-white py-2.5 pl-2.5 pr-3.5"
  >
    <div className="h-[72px] w-[72px] flex-shrink-0 animate-pulse rounded-lg bg-gray-200" />

    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <div className="h-3.5 w-4/5 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
      <div className="mt-0.5 h-3 w-3/5 animate-pulse rounded bg-gray-200" />
    </div>
  </div>
);
