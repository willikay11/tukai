'use client';
import { Search01Icon, FilterHorizontalIcon } from '@hugeicons/react-pro';
import { usePathname } from 'next/navigation';
export default function Search() {
  const pathname = usePathname();

  return (
    <div className="inline-flex h-10 w-full items-center justify-between rounded-full border-[1px] border-gray-200 bg-white py-4 pl-4 pr-1">
      <Search01Icon size={20} className="mr-2 text-gray-500" variant="twotone" />
      <div className="flex w-full flex-col md:w-[90%]">
        <p className="mb-0 text-xs text-gray-700">
          {pathname === '/'
            ? "What's the plan?"
            : pathname === '/experiences'
              ? 'Find Experiences?'
              : 'Find Your Communities?'}
        </p>
        <input
          className="mt-[2px] h-full w-full text-[11px] outline-0 placeholder:text-[11px] placeholder:text-gray-400 hover:border-primary focus:border-primary"
          placeholder={
            pathname === '/'
              ? 'Any City . Any day'
              : pathname === '/experiences'
                ? 'Any City . By Activity'
                : 'Any City . By Activity'
          }
        />
      </div>
      <div className="ml-2 flex h-[30px] w-[36px] items-center justify-center rounded-full bg-gray-100">
        <FilterHorizontalIcon className="text-gray-800" size={15} variant="twotone" />
      </div>
    </div>
  );
}
