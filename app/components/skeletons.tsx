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
    <div className="inline-flex h-[5rem] items-center gap-2">
      <PillSkeleton />
      <PillSkeleton />
      <PillSkeleton />
      <PillSkeleton />
      <PillSkeleton />
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
        <div className="h-[20rem] w-full rounded-md bg-gray-200 text-sm font-medium md:h-[20rem] 2xl:h-[10rem] 2xl:h-[17rem]" />
      </div>
      <div className="flex flex-col items-start justify-start bg-transparent">
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

export function PostSkeleton() {
  return (
    <div className={`${shimmer} relative rounded-lg bg-white p-4`}>
      <div className="mb-4 flex items-start gap-3">
        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="mb-2 h-5 w-40 rounded-[6px] bg-gray-200" />
          <div className="h-4 w-56 rounded-[6px] bg-gray-200" />
        </div>
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-4 w-full rounded-[6px] bg-gray-200" />
        <div className="h-4 w-full rounded-[6px] bg-gray-200" />
        <div className="h-4 w-3/4 rounded-[6px] bg-gray-200" />
      </div>
      <div className="flex items-center gap-4">
        <div className="h-5 w-20 rounded-[6px] bg-gray-200" />
        <div className="h-5 w-24 rounded-[6px] bg-gray-200" />
      </div>
    </div>
  );
}

export function CreateStepContentSkeleton() {
  return (
    <div className={`${shimmer} relative mt-6 space-y-4`}>
      <div className="h-6 w-48 rounded-md bg-gray-200" />
      <div className="h-4 w-full rounded-md bg-gray-200" />
      <div className="h-4 w-10/12 rounded-md bg-gray-200" />
      <div className="h-12 w-full rounded-xl bg-gray-200" />
      <div className="h-12 w-full rounded-xl bg-gray-200" />
      <div className="h-12 w-2/3 rounded-xl bg-gray-200" />
    </div>
  );
}

export function WalletListSkeleton() {
  return (
    <div className={`${shimmer} relative mt-3 space-y-3`}>
      <div className="h-4 w-28 rounded-md bg-gray-200" />
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-2 h-4 w-40 rounded-md bg-gray-200" />
        <div className="mb-2 h-3 w-52 rounded-md bg-gray-200" />
        <div className="h-3 w-24 rounded-md bg-gray-200" />
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-2 h-4 w-36 rounded-md bg-gray-200" />
        <div className="mb-2 h-3 w-48 rounded-md bg-gray-200" />
        <div className="h-3 w-20 rounded-md bg-gray-200" />
      </div>
    </div>
  );
}

export function ReviewWalletsSkeleton() {
  return (
    <div className={`${shimmer} relative mt-6 rounded-[12px] border border-gray-200 bg-gray-100 p-5`}>
      <div className="mb-3 h-5 w-36 rounded-md bg-gray-200" />
      <div className="mb-4 h-3 w-56 rounded-md bg-gray-200" />
      <div className="space-y-3">
        <div className="rounded-[12px] border border-gray-200 bg-white p-4">
          <div className="mb-2 h-4 w-24 rounded-md bg-gray-200" />
          <div className="h-3 w-44 rounded-md bg-gray-200" />
        </div>
        <div className="rounded-[12px] border border-gray-200 bg-white p-4">
          <div className="mb-2 h-4 w-36 rounded-md bg-gray-200" />
          <div className="h-3 w-52 rounded-md bg-gray-200" />
        </div>
      </div>
    </div>
  );
}