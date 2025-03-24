const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function PillSkeleton() {
  return (
    <div className={`${shimmer} relative`}>
      <div className="mb-2 h-[2.5rem] w-24 rounded-[2.5rem] bg-gray-200" />
    </div>
  );
}

export function PillsSkeleton() {
  return (
    <div className="w-full border-b-[1px] border-gray-100 bg-white">
      <div className="grid grid-cols-12 gap-4">
        <div className="relative col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0">
          <div className="inline-flex h-[5rem] items-center gap-2">
            <PillSkeleton />
            <PillSkeleton />
            <PillSkeleton />
            <PillSkeleton />
            <PillSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
export function EventsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
      <EventSkeleton />
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

export function ImageSkeleton() {
  return (
    <div className={`${shimmer} relative h-full w-full`}>
      <div className="h-full w-full rounded-md bg-gray-200 text-sm font-medium" />
    </div>
  );
}
