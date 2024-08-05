const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
    </div>
  );
}

export function EventSkeleton() {
  return (
    <div className={`${shimmer} relative`}>
      <div className="mb-2 flex">
        <div className="h-[20rem] w-full rounded-md bg-gray-200 text-sm font-medium md:h-[20rem] 2xl:h-[10rem]" />
      </div>
      <div className="flex flex-col items-start justify-start bg-white">
        <div className="mb-2 h-5 w-40 rounded-[6px] bg-gray-200" />
        <div className="mb-2 h-5 w-24 rounded-[6px] bg-gray-200" />
        <div className="h-5 w-28 rounded-[6px] bg-gray-200" />
      </div>
    </div>
  );
}
