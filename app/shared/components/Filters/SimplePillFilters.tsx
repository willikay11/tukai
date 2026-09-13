'use client';

import { useEffect, useRef, useState } from 'react';

import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/react-pro';
import clsx from 'clsx';

import { IconComponent } from '@/app/shared/components/Icons';

interface SimplePillFiltersProps {
  filters: {
    label: string;
    value: string;
    // Category filters lead with an icon; the search popover's type tabs are
    // label-and-count only
    icon?: string;
    count?: number;
  }[];
  selected: string | null;
  onChange: (value: string) => void;
  // 'panel' is the treatment used inside a white surface (the search popover):
  // the selected pill is a raised white chip rather than a tinted one
  variant?: 'default' | 'panel';
}

export const SimplePillFilters = ({
  filters,
  selected,
  onChange,
  variant = 'default',
}: SimplePillFiltersProps) => {
  const scrollBy = useRef<number>(500);
  const ref = useRef<any>();
  const [showPrevBtn, setShowPrevBtn] = useState<boolean>(false);
  const [showNextBtn, setShowNextBtn] = useState<boolean>(false);

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
    const walk = (x - slider.startX) * 2;
    slider.scrollLeft = slider.scrollLeft - walk;
  };

  useEffect(() => {
    const slider = ref.current;
    if (!slider) return;

    const updateButtons = () => {
      scrollBy.current = slider.offsetWidth - 100;

      if (slider.scrollWidth <= slider.offsetWidth) {
        setShowNextBtn(false);
        setShowPrevBtn(false);
        return;
      }

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

  return (
    <div className="relative">
      <button
        className={clsx(
          'absolute left-0 top-1.5 z-10 rounded-full border-[1px] bg-white p-1 text-gray-300 shadow-scroll-filters',
          {
            hidden: !showPrevBtn,
            block: showPrevBtn,
          },
        )}
        onClick={() => {
          ref.current?.scrollTo({ left: ref.current?.scrollLeft - scrollBy.current });
        }}
      >
        <ArrowLeft01Icon size={16} className="text-gray-700" variant="twotone" />
      </button>
      <div
        ref={ref}
        className="flex h-10 items-center gap-2 overflow-x-auto scroll-smooth scrollbar-hide"
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {filters?.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={clsx(
              'flex h-9 flex-shrink-0 flex-row items-center justify-center rounded-full transition-colors',
              variant === 'panel' ? 'px-4 text-sm' : 'px-3 py-2 text-xs font-medium',
              variant === 'panel'
                ? {
                    'border border-gray-200 bg-white font-semibold text-gray-900 shadow-sm':
                      selected === filter.value,
                    'text-gray-500 hover:text-gray-800': selected !== filter.value,
                  }
                : {
                    'bg-emerald-100 text-primary': selected === filter.value,
                    'bg-gray-100 text-gray-600 hover:border-primary hover:text-primary':
                      selected !== filter.value,
                  },
            )}
          >
            {filter.icon && <IconComponent iconName={filter.icon} size={14} />}
            <span className={clsx('text-nowrap', filter.icon && 'ml-1.5')}>{filter.label}</span>
            {filter.count !== undefined && (
              <span className="ml-1.5 text-nowrap">&middot; {filter.count}</span>
            )}
          </button>
        ))}
      </div>
      <button
        className={clsx(
          'absolute right-0 top-1.5 z-10 rounded-full border-[1px] bg-white p-1 text-gray-300 shadow-scroll-filters',
          {
            hidden: !showNextBtn,
            block: showNextBtn,
          },
        )}
        onClick={() => {
          ref.current?.scrollTo({ left: ref.current?.scrollLeft + scrollBy.current });
        }}
      >
        <ArrowRight01Icon size={16} className="text-gray-700" variant="twotone" />
      </button>
    </div>
  );
};
