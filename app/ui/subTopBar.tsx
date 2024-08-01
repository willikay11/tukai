'use client';

import IconRadioButtonGroup from '@/app/ui/iconRadioButtonGroup';
import { FilterHorizontalIcon, Search01Icon, Sun02Icon } from '@hugeicons/react-pro';

const Search = () => {
  return (
    <div className="inline-flex h-10 w-full items-center justify-between rounded-full border-[1px] border-gray-200 bg-white pl-2 pr-1 md:w-96">
      <Search01Icon size={16} className="mr-2 text-gray-500" variant="twotone" />
      <div className="flex w-full flex-col md:w-[90%]">
        <p className="mb-0 text-xs text-gray-700">What&apos;s the plan?</p>
        <input
          className="mt-[2px] h-full w-full text-[11px] outline-0 placeholder:text-[11px] placeholder:text-gray-400 hover:border-primary focus:border-primary"
          placeholder={`Any experience . Anywhere . Any day`}
        />
      </div>
      <div className="ml-2 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-gray-100">
        <FilterHorizontalIcon className="text-gray-800" size={15} variant="twotone" />
      </div>
    </div>
  );
};
export default function SubTopBar() {
  return (
    <div className="w-full bg-gray-50 py-4 md:h-[80px] md:py-0">
      <div className="grid h-full grid-cols-12 gap-4">
        <div className="col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0">
          <div className="mb-2.5 block w-full md:mb-0 md:hidden">
            <Search />
          </div>
          <div className="flex items-center justify-between md:h-full">
            <IconRadioButtonGroup />
            <div className="hidden md:block">
              <Search />
            </div>
            <div className="inline-flex items-center">
              <Sun02Icon size={18} className="text-yellow-500" variant="twotone" />
              <span className="mx-2 text-xs text-gray-500">26°</span>
              <div className="mr-2 h-[10px] w-[1px] bg-gray-300" />
              <span className="text-xs text-gray-500">Nairobi, Kenya</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
