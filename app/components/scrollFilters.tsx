'use client';

import { useEffect, useRef, useState } from 'react';

import { useSession } from 'next-auth/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/react-pro';
import clsx from 'clsx';

import IconComponent from '@/app/components/iconComponent';
import { useAuthDialog } from '@/context/AuthDialogContext';
import { useSelectedCategory } from '@/context/SelectedCategoryContext';

export default function ScrollFilters({
  filters,
}: {
  filters: { label: string; value: string; icon: string; shouldBeLoggedIn?: boolean }[];
}) {
  const scrollBy = useRef<number>(500);
  const ref = useRef<any>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { selectedCategoryId, setSelectedCategoryId } = useSelectedCategory();
  const { setOpenSignIn } = useAuthDialog();
  const [showPrevBtn, setShowPrevBtn] = useState<boolean>(false);
  const [showNextBtn, setShowNextBtn] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(selectedCategoryId);
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
    setSelectedOption(selectedCategoryId); // Update selected category if changed
  }, [selectedCategoryId]);

  useEffect(() => {
    const slider = ref.current;
    if (!slider) return;

    const updateButtons = () => {
      // update scrollBy based on visible width
      scrollBy.current = slider.offsetWidth - 100;

      // If content fits within view, hide both buttons
      if (slider.scrollWidth <= slider.offsetWidth) {
        setShowNextBtn(false);
        setShowPrevBtn(false);
        return;
      }

      // Otherwise determine visibility by scroll position
      if (slider.offsetWidth + slider.scrollLeft >= slider.scrollWidth - 5) {
        setShowNextBtn(false);
      } else {
        setShowNextBtn(true);
      }

      if (slider.scrollLeft > 0) {
        setShowPrevBtn(true);
      } else {
        setShowPrevBtn(false);
      }
    };

    // initial check
    updateButtons();

    const onResize = () => updateButtons();
    const onScroll = () => updateButtons();

    window.addEventListener('resize', onResize);
    slider.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('resize', onResize);
      slider.removeEventListener('scroll', onScroll);
    };
  }, [filters]);

  // Handle filter change and update URL with categoryId
  const handleCategoryChange = (categoryId: string) => {
    if (filters.find((filter) => filter.value === categoryId)?.shouldBeLoggedIn && !session) {
      setOpenSignIn(true);
      return;
    }
    setSelectedOption(categoryId);
    setSelectedCategoryId(categoryId);
    // Update the query params in the URL without reloading the page, but only if on the client-side
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', categoryId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: true });
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
          ref.current?.scrollTo({ left: ref.current?.scrollLeft - scrollBy.current });
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
          ref.current?.scrollTo({ left: ref.current?.scrollLeft + scrollBy.current });
        }}
      >
        <ArrowRight01Icon size={20} className="text-gray-700" variant="twotone" />
      </button>
    </div>
  );
}
