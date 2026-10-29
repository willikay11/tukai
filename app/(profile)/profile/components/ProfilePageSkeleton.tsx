'use client';

const Pulse = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ''}`} />
);

// Shaped like ProfileCard + ProfileTabs + OverviewTab so the layout doesn't jump once real data lands.
export const ProfilePageSkeleton = () => (
  <div aria-hidden="true">
    <div className="mt-[18px] flex items-center justify-center gap-2 py-2.5">
      {Array.from({ length: 6 }).map((_, index) => (
        <Pulse key={index} className="h-11 w-28 flex-shrink-0 rounded-full" />
      ))}
    </div>

    <div className="flex flex-wrap items-start gap-7 pt-[18px]">
      <aside className="flex min-w-0 flex-[1_1_340px] max-w-[380px] flex-col gap-2">
        <div className="flex flex-col gap-3.5 rounded-xl border-[0.5px] border-line-shell bg-shell p-1.5">
          <div className="flex flex-col gap-3.5 rounded-xl border-[0.5px] border-surface bg-white p-[18px]">
            <div className="flex items-center gap-3.5">
              <Pulse className="h-[72px] w-[72px] flex-shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Pulse className="h-5 w-3/4 rounded-full" />
                <Pulse className="h-3.5 w-1/2 rounded-full" />
              </div>
            </div>
            <Pulse className="h-3.5 w-2/3 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-px rounded-xl bg-surface-muted">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-1 bg-white px-[18px] py-3">
                <Pulse className="h-5 w-8 rounded-full" />
                <Pulse className="h-3 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="grid min-w-0 flex-[999_1_560px] grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-7">
        <div className="flex min-w-0 flex-col gap-7">
          <Pulse className="h-[122px] w-full rounded-xl" />

          <div className="flex flex-col gap-3">
            <Pulse className="h-5 w-32 rounded-full" />
            <Pulse className="h-[190px] w-full rounded-14" />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-7">
          <div className="flex flex-col gap-3">
            <Pulse className="h-5 w-28 rounded-full" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Pulse key={index} className="h-[38px] w-24 rounded-full" />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Pulse className="h-5 w-40 rounded-full" />
            {Array.from({ length: 3 }).map((_, index) => (
              <Pulse key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
