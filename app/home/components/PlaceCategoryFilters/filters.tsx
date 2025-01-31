'use client';

import { PlaceCategory } from '@/app/lib/definitions';
import clsx from 'clsx';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/react-pro';
import { useEffect, useRef, useState } from 'react';
import IconComponent from '@/app/ui/iconComponent';

export default function PlaceCategoriesScrollFilters({
  placesCategories,
}: {
  placesCategories: PlaceCategory[];
}) {
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
    <div className="relative">
      <button
        className={clsx(
          'absolute left-0 top-6 rounded-full border-[1px] bg-white p-1 text-gray-300 drop-shadow-[0_0_4px_rgba(0,0,0,0.25)]',
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
      <div ref={ref} className="flex h-[5rem] items-center overflow-hidden scroll-smooth">
        {placesCategories.map((placesCategory, index) => (
          <button
            key={placesCategory.id}
            className={clsx(
              'flex h-[2.5rem] flex-row items-center justify-center rounded-[2.5rem] bg-gray-100 px-4 py-2',
              {
                'bg-emerald-100 text-primary': selectedOption === placesCategory.name,
                'text-gray-500': selectedOption !== placesCategory.name,
                'mr-[10px]': index !== placesCategories.length - 1,
              },
            )}
            onClick={() => setSelectedOption(placesCategory.name)}
          >
            <IconComponent iconName={placesCategory.icon} size={18} />
            <span
              className={clsx('ml-2 text-nowrap text-xs', {
                'text-gray-700': selectedOption !== placesCategory.name,
                'font-semibold text-primary': selectedOption === placesCategory.name,
              })}
            >
              {placesCategory.name}
            </span>
          </button>
        ))}
      </div>
      <button
        className={clsx(
          'absolute right-0 top-6 rounded-full border-[1px] bg-white p-1 text-gray-300 drop-shadow-[0_0_4px_rgba(0,0,0,0.25)]',
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
  );
}
