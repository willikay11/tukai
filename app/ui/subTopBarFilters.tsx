'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { interests } from '@/app/lib/placeholderData';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/react-pro';

export default function SubTopBarFilters() {
  let scrollBy = 500;
  const ref = useRef<any>();
  const [showPrevBtn, setShowPrevBtn] = useState<boolean>(false);
  const [showNextBtn, setShowNextBtn] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<string>('hiking');

  useEffect(() => {
    if (ref.current) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      scrollBy = ref?.current?.offsetWidth - 100;

      window.addEventListener('resize', () => {
        if (ref?.current?.scrollWidth === ref?.current?.offsetWidth) {
          setShowNextBtn(false);
        }

        if (ref?.current?.scrollWidth > ref?.current?.offsetWidth) {
          setShowNextBtn(true);
        }
      });

      ref?.current?.addEventListener('scroll', () => {
        if (ref.current?.offsetWidth + ref.current?.scrollLeft >= ref?.current?.scrollWidth - 5) {
          setShowNextBtn(false);
        }

        if (ref.current?.offsetWidth + ref.current?.scrollLeft < ref?.current?.scrollWidth) {
          setShowNextBtn(true);
        }

        if (ref.current?.scrollLeft > 0) {
          setShowPrevBtn(true);
        }

        if (ref.current?.scrollLeft === 0) {
          setShowPrevBtn(false);
          setShowNextBtn(true);
        }
      });
    }
  });

  return (
    <div className="w-full border-b-[1px] border-gray-100 bg-white">
      <div className="grid grid-cols-12 gap-4">
        <div className="relative col-span-12 mx-4 md:col-span-10 md:col-start-2 md:mx-0">
          <button
            className={clsx(
              'absolute left-0 top-3 rounded-full border-[1px] bg-white p-1 text-gray-300 drop-shadow-[0_0_4px_rgba(0,0,0,0.25)]',
              {
                hidden: !showPrevBtn,
                block: showPrevBtn,
              },
            )}
            onClick={() => {
              ref.current?.scrollTo({ left: ref.current?.scrollLeft - scrollBy });
            }}
          >
            <ArrowLeft01Icon size={20} className="text-gray-700" variant="twotone" />
          </button>
          <div ref={ref} className="flex h-[60px] items-center overflow-hidden scroll-smooth">
            {interests.map((option, index) => (
              <button
                key={option.label}
                className={clsx(
                  'flex h-[40px] flex-row items-center justify-center rounded-[2.5rem] bg-gray-100 px-4 py-2',
                  {
                    'bg-emerald-100 text-primary': selectedOption === option.value,
                    'text-gray-500': selectedOption !== option.value,
                    'mr-[10px]': index !== interests.length - 1,
                  },
                )}
                onClick={() => setSelectedOption(option.value)}
              >
                {option.icon}
                <span
                  className={clsx('ml-2 text-nowrap text-xs', {
                    'text-gray-700': selectedOption !== option.value,
                    'font-semibold text-primary': selectedOption === option.value,
                  })}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </div>
          <button
            className={clsx(
              'absolute right-0 top-3 rounded-full border-[1px] bg-white p-1 text-gray-300 drop-shadow-[0_0_4px_rgba(0,0,0,0.25)]',
              {
                hidden: !showNextBtn,
                block: showNextBtn,
              },
            )}
            onClick={() => {
              ref.current?.scrollTo({ left: ref.current?.scrollLeft + scrollBy });
            }}
          >
            <ArrowRight01Icon size={20} className="text-gray-700" variant="twotone" />
          </button>
        </div>
      </div>
    </div>
  );
}
