const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function EventsSkeleton() {
    return(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7 gap-x-4 gap-y-8">
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
    return(
        <div
            className={`${shimmer} relative`}
        >
            <div className="flex mb-2">
                <div className="h-[20rem] md:h-[20rem] 2xl:h-[10rem]  w-full rounded-md bg-gray-200 text-sm font-medium" />
            </div>
            <div className="flex flex-col items-start justify-start bg-white">
                <div className="rounded-[6px] h-5 w-40 bg-gray-200 mb-2" />
                <div className="rounded-[6px] h-5 w-24 bg-gray-200 mb-2" />
                <div className="rounded-[6px] h-5 w-28 bg-gray-200" />
            </div>
        </div>
    )
}