import SubTopBar from "@/app/ui/subTopBar";
import SubTopBarFilters from "@/app/ui/subTopBarFilters";
import {EventsSkeleton} from "@/app/ui/skeletons";
import {Suspense} from "react";
import Experiences from "@/app/ui/experiences";

export default function Home() {
  return (
    <main className="h-full grid grid-cols-12 gap-4">
        <div className="col-span-12">
            <SubTopBar />
            <SubTopBarFilters />
        </div>
        <div className="col-span-12 mx-4 md:mx-0 md:col-start-2 md:col-span-10 mb-4">
            <Suspense fallback={<EventsSkeleton />}>
                <Experiences />
            </Suspense>
        </div>
    </main>
  );
}
