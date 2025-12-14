'use client';

import clsx from 'clsx';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/react-pro';
import { useEffect, useRef, useState } from 'react';
import IconComponent from '@/app/components/iconComponent';
import { useRouter } from 'next/navigation';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';
import { useSession } from 'next-auth/react';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { set } from 'lodash';

export default function ScrollFilters({
  filters,
  selectedCategory,
}: {
  filters: { label: string; value: string; icon: string; shouldBeLoggedIn?: boolean }[];
  selectedCategory?: string;
}) {
  let scrollBy = 500;
  const ref = useRef<any>();
  const { data: session } = useSession();
  const { setSelectedCategoryId } = useSelectedCategory();
  const { setOpenSignIn } = useAuthDialog();
  const [showPrevBtn, setShowPrevBtn] = useState<boolean>(false);
  const [showNextBtn, setShowNextBtn] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(selectedCategory);
  const router = useRouter();

  const handleMouseDown = (e: React.MouseEvent) => {
    const slider = ref.current;
    slider.isDown = true;
    slider.startX = e.pageX - slider.offsetLeft;
    slider.scrollLeft = slider.scrollLeft;
  };

  const handleMouseLeave = () => {
    const slider = ref.current;
    slider.isDown = false;
  };

  const handleMouseUp = () => {
    const slider = ref.current;
    slider.isDown = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const slider = ref.current;
    if (!slider.isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - slider.startX) * 2; // Scroll-fast
    slider.scrollLeft = slider.scrollLeft - walk;
  };
  // Get category from URL or use default
  useEffect(() => {
    setSelectedOption(selectedCategory); // Update selected category if changed
  }, [selectedCategory]);

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

  // Handle filter change and update URL with categoryId
  const handleCategoryChange = (categoryId: string) => {
    if (filters.find((filter) => filter.value === categoryId)?.shouldBeLoggedIn && !session) {
      setOpenSignIn(true);
      return;
    }
    setSelectedOption(categoryId);
    setSelectedCategoryId(categoryId);
    // Update the query params in the URL without reloading the page, but only if on the client-side
    router.replace(`?category=${categoryId}`, { scroll: false });
  };

  return (
    <div className="relative">
      <button
        className={clsx(
          'absolute left-0 top-6 rounded-full border-[1px] bg-white p-1 text-gray-300 shadow-scroll-filters',
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
      <div
        ref={ref}
        className="flex h-[5rem] items-center overflow-x-auto scroll-smooth no-scrollbar"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {filters?.map((filter, index) => (
          <button
            key={filter.value}
            className={clsx(
              'flex h-[2.5rem] flex-row items-center justify-center rounded-[2.5rem] px-4 py-2',
              {
                'bg-emerald-100 text-primary': selectedOption === filter.value,
                'bg-gray-100 text-gray-500': selectedOption !== filter.value,
                'mr-[10px]': index !== filters.length - 1,
              },
            )}
            onClick={() => handleCategoryChange(filter.value)}
          >
            <IconComponent iconName={filter.icon} size={18} />
            <span
              className={clsx('ml-2 text-nowrap text-xs', {
                'font-medium text-gray-700': selectedOption !== filter.value,
                'font-semibold text-primary': selectedOption === filter.value,
              })}
            >
              {filter.label}
            </span>
          </button>
        ))}
      </div>
      <button
        className={clsx(
          'absolute right-0 top-6 rounded-full border-[1px] bg-white p-1 text-gray-300 shadow-scroll-filters',
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
