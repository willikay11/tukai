'use client';

import IconRadioButtonGroup from "@/app/ui/iconRadioButtonGroup";
import {FilterHorizontalIcon, Search01Icon, Sun02Icon} from "@hugeicons/react-pro";

const Search = () => {
  return (
      <div className="w-full md:w-96 h-10 rounded-full border-[1px] border-gray-200 inline-flex bg-white items-center justify-between pl-2 pr-1">
          <Search01Icon size={16} className="text-gray-500 mr-2" variant="twotone" />
          <div className="w-full md:w-[90%] flex flex-col">
              <p className="text-xs mb-0 text-gray-700">What&apos;s the plan?</p>
              <input
                  className="mt-[2px] w-full h-full outline-0 hover:border-primary focus:border-primary text-[11px] placeholder:text-[11px] placeholder:text-gray-400"
                  placeholder={`Any experience . Anywhere . Any day`}
              />
          </div>
          <div className="ml-2 h-[30px] w-[30px] rounded-full flex items-center justify-center bg-gray-100">
              <FilterHorizontalIcon className="text-gray-800" size={15} variant="twotone" />
          </div>
      </div>
  );
}
export default function SubTopBar() {
    return(
        <div className="py-4 md:py-0 md:h-[80px] w-full bg-gray-50">
            <div className="grid grid-cols-12 gap-4 h-full">
                <div className="col-span-12 mx-4 md:mx-0 md:col-start-2 md:col-span-10">
                    <div className="w-full block mb-2.5 md:mb-0 md:hidden">
                        <Search />
                    </div>
                    <div className="md:h-full flex items-center justify-between">
                        <IconRadioButtonGroup />
                        <div className="hidden md:block">
                            <Search />
                        </div>
                        <div className="inline-flex items-center">
                            <Sun02Icon size={18} className="text-yellow-500" variant="twotone" />
                            <span className="text-xs text-gray-500 mx-2">26°</span>
                            <div className="h-[10px] w-[1px] bg-gray-300 mr-2" />
                            <span className="text-xs text-gray-500">Nairobi, Kenya</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}