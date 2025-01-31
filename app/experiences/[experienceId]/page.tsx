import { ArrowLeft02Icon, Bookmark02Icon, Share08Icon } from '@hugeicons/react-pro';
export default function ViewExperiencePage() {
  return (
    <main className="grid grid-cols-12 gap-4">
      <div className="col-span-12 mt-8 md:col-span-6 md:col-start-4">
        <div className="inline-flex w-full justify-between">
          <div className="inline-flex">
            <div className="mr-3.5 flex items-start">
              <ArrowLeft02Icon size={24} variant="twotone" />
            </div>
            <div className="flex flex-col">
              <p className="mb-1 text-2xl font-black text-gray-700">Tigoni E-Bike Tours</p>
              <p className="text-base text-gray-700">Feb 23, 10:00 AM - 5:00 PM</p>
            </div>
          </div>
          <div className="inline-flex items-start">
            <div className="inline-flex items-center">
              <Bookmark02Icon size={16} variant="twotone" className="text-primary" />
              <div className="mx-2 h-[8px] w-[1px] rounded bg-gray-300" />
              <Share08Icon size={16} variant="twotone" className="text-primary" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
