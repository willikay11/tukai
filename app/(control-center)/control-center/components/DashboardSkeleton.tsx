'use client';

const Pulse = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ''}`} />
);

// Shaped like the tab bar + aside + two-column grid so the layout doesn't jump once real data lands.
export const DashboardSkeleton = () => (
  <div aria-hidden="true">
    <div className="mt-[18px] flex items-center justify-center gap-2 py-2.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Pulse key={index} className="h-11 w-32 flex-shrink-0 rounded-full" />
      ))}
    </div>

    <div className="flex flex-wrap items-start gap-7 pt-[18px]">
      <aside className="flex min-w-0 flex-[1_1_340px] max-w-[380px] flex-col gap-2">
        <Pulse className="h-[190px] w-full rounded-xl" />
        <Pulse className="h-[160px] w-full rounded-xl" />
      </aside>

      <div className="grid min-w-0 flex-[999_1_560px] grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-7">
        <div className="flex min-w-0 flex-col gap-7">
          <div className="flex flex-col gap-3">
            <Pulse className="h-5 w-36 rounded-full" />
            <Pulse className="h-[220px] w-full rounded-14" />
          </div>
          <div className="flex flex-col gap-3">
            <Pulse className="h-5 w-28 rounded-full" />
            <Pulse className="h-[160px] w-full rounded-14" />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-7">
          <div className="flex flex-col gap-3">
            <Pulse className="h-5 w-64 rounded-full" />
            <Pulse className="h-[220px] w-full rounded-14" />
          </div>
          <div className="flex flex-col gap-3">
            <Pulse className="h-5 w-32 rounded-full" />
            <Pulse className="h-[140px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
