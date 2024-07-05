const shimmer =
    'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function EventsSkeleton() {
    return(
        <div className="grid grid-cols-12 gap-x-4 gap-y-8">
            <div className="col-span-6 md:col-span-4 lg:col-span-3 2xl:col-span-2">
               <EventSkeleton />
           </div>
           <div className="col-span-6 md:col-span-4 lg:col-span-3 2xl:col-span-2">
               <EventSkeleton />
           </div>
           <div className="col-span-6 md:col-span-4 lg:col-span-3 2xl:col-span-2">
               <EventSkeleton />
           </div>
           <div className="col-span-6 md:col-span-4 lg:col-span-3 2xl:col-span-2">
               <EventSkeleton />
           </div>
           <div className="col-span-6 md:col-span-4 lg:col-span-3 2xl:col-span-2">
               <EventSkeleton />
           </div>
           <div className="col-span-6 md:col-span-4 lg:col-span-3 2xl:col-span-2">
               <EventSkeleton />
           </div>
        </div>
    );
}

export function EventSkeleton() {
    return(
        <div
            className={`${shimmer} relative`}
        >
            <div className="flex mb-2">
                <div className="h-56 w-full rounded-md bg-gray-200 text-sm font-medium" />
            </div>
            <div className="flex flex-col items-start justify-start bg-white">
                <div className="rounded-[6px] h-5 w-40 bg-gray-200 mb-2" />
                <div className="rounded-[6px] h-5 w-24 bg-gray-200 mb-2" />
                <div className="rounded-[6px] h-5 w-28 bg-gray-200" />
            </div>
        </div>
    )
}